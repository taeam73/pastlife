import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  files: new Map<string, Uint8Array>(),
  downloads: 0,
}));

vi.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA256' },
  digestStringAsync: async (_algorithm: string, value: string) => encodeURIComponent(value),
}));

vi.mock('expo-file-system', () => {
  class MockFile {
    uri: string;
    constructor(_directory: unknown, name: string) { this.uri = name; }
    get exists() { return state.files.has(this.uri); }
    get size() { return state.files.get(this.uri)?.length ?? 0; }
    async bytes() { return state.files.get(this.uri) ?? new Uint8Array(); }
    delete() { state.files.delete(this.uri); }
    static async downloadFileAsync(_url: string, file: MockFile) {
      state.downloads += 1;
      state.files.set(file.uri, new Uint8Array([0xff, 0xd8, 0xff, ...Array(125).fill(1)]));
      return file;
    }
  }
  return { File: MockFile, Paths: { cache: 'cache' } };
});

import { discardStoryArtworkFile, ensureStoryArtworkFile } from './storyArtworkCache';

describe('shared story artwork cache', () => {
  beforeEach(() => { state.files.clear(); state.downloads = 0; });

  it('shares one download across simultaneous screen and PDF requests', async () => {
    const uri = 'https://cdn.example.com/scene.webp';
    const [screen, pdf] = await Promise.all([ensureStoryArtworkFile(uri), ensureStoryArtworkFile(uri)]);
    expect(screen.uri).toBe(pdf.uri);
    expect(state.downloads).toBe(1);
    expect((await ensureStoryArtworkFile(uri)).uri).toBe(screen.uri);
    expect(state.downloads).toBe(1);
  });

  it('redownloads invalid artwork instead of passing it to the PDF', async () => {
    const uri = 'https://cdn.example.com/scene.webp';
    const first = await ensureStoryArtworkFile(uri);
    state.files.set(first.uri, new Uint8Array(130));
    await ensureStoryArtworkFile(uri);
    expect(state.downloads).toBe(2);
    await discardStoryArtworkFile(uri);
    expect(state.files.has(first.uri)).toBe(false);
  });
});
