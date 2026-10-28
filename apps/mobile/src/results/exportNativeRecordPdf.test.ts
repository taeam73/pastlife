import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  formats: new Map<string, string>(),
  bytes: new Map<string, Uint8Array>(),
  assetDownloads: 0,
  logoUri: 'file://logo.png',
}));

vi.mock('expo-asset', () => ({
  Asset: { fromModule: () => ({ downloadAsync: async () => { state.assetDownloads += 1; return { localUri: state.logoUri }; } }) },
}));
vi.mock('expo-file-system', () => ({
  File: class {
    constructor(readonly uri: string) {}
    async base64() { return state.formats.get(this.uri) ?? 'iVBORw0KGgo'; }
    async bytes() { return state.bytes.get(this.uri) ?? new Uint8Array(); }
  },
}));
vi.mock('expo-print', () => ({}));
vi.mock('expo-sharing', () => ({}));
vi.mock('../i18n/locale', () => ({ localeText: () => '', translate: () => '' }));
vi.mock('./libraryImages', () => ({ resolveLibraryImage: (uri: string) => ({ uri }) }));
vi.mock('./storyArtworkCache', () => ({
  ensureStoryArtworkFile: async (uri: string) => ({
    uri,
    base64: async () => {
      if (state.bytes.has(uri)) throw new Error('native base64 unavailable');
      return state.formats.get(uri) ?? '/9j/original';
    },
    bytes: async () => state.bytes.get(uri) ?? new Uint8Array(),
  }),
  discardStoryArtworkFile: async () => undefined,
}));

import { assetDataUri, prepareNativeRecordPdfArtwork } from './exportNativeRecordPdf';
import type { PdfRecord } from './exportRecordPdf';

const record: PdfRecord = {
  locale: 'en', resultId: 'one', recordNo: 1, name: 'One',
  cover: { era: '', place: '', role: '', birthYear: '', deathYear: '', lifeLine: '' },
  backgroundUri: 'https://cdn.example/background.jpg',
  characterUri: 'https://cdn.example/character.webp',
  chapters: ['MEETING', 'TRIAL', 'CHOICE', 'NOW'].map((id) => ({ id: id as PdfRecord['chapters'][number]['id'], title: id, body: '' })),
  finalMoment: { year: '', place: '', scene: '', afterword: '', illustrationUri: 'https://cdn.example/final.png' },
};

describe('native PDF artwork preparation', () => {
  beforeEach(() => {
    state.formats.clear(); state.bytes.clear(); state.assetDownloads = 0; state.logoUri = 'file://logo.png';
    state.formats.set(record.backgroundUri, '/9j/background');
    state.formats.set(record.characterUri!, 'UklGRcharacter');
    state.formats.set(record.finalMoment.illustrationUri, 'iVBORw0KGgofinal');
  });

  it('reuses cached JPG, PNG, and WebP artwork and skips the unused Korean logo', async () => {
    const artwork = await prepareNativeRecordPdfArtwork(record);
    expect(artwork.logo).toBeNull();
    expect(artwork.background).toBe('data:image/jpeg;base64,/9j/background');
    expect(artwork.character).toBe('data:image/webp;base64,UklGRcharacter');
    expect(artwork.finalArt).toBe('data:image/png;base64,iVBORw0KGgofinal');
    expect(state.assetDownloads).toBe(0);
  });

  it('reads saved image bytes when native base64 reading fails', async () => {
    state.bytes.set(record.backgroundUri, new Uint8Array([0xff, 0xd8, 0xff, 0xd9]));
    const artwork = await prepareNativeRecordPdfArtwork(record);
    expect(artwork.background).toBe('data:image/jpeg;base64,/9j/2Q==');
  });

  it('continues with a text wordmark when Android exposes the bundled logo as a relative resource name', async () => {
    state.logoUri = 'title_logo_plain';
    expect(await assetDataUri(42)).toBeNull();
    expect(state.assetDownloads).toBe(1);
  });

});
