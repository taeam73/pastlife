import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  files: new Map<string, Uint8Array>(),
  downloads: 0,
  nativeFailure: false,
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
    write(bytes: Uint8Array) { state.files.set(this.uri, bytes); }
    delete() { state.files.delete(this.uri); }
    static async downloadFileAsync(_url: string, file: MockFile) {
      state.downloads += 1;
      if (state.nativeFailure) throw new Error('native download unavailable');
      state.files.set(file.uri, new Uint8Array([0xff, 0xd8, 0xff, ...Array(123).fill(1), 0xff, 0xd9]));
      return file;
    }
  }
  return { File: MockFile, Paths: { cache: 'cache' } };
});

import { discardStoryArtworkFile, ensureStoryArtworkFile } from './storyArtworkCache';

describe('shared story artwork cache', () => {
  beforeEach(() => { state.files.clear(); state.downloads = 0; state.nativeFailure = false; });

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
    state.files.set(first.uri, new Uint8Array([0xff, 0xd8, 0xff, ...Array(127).fill(1)]));
    await ensureStoryArtworkFile(uri);
    expect(state.downloads).toBe(2);
    await discardStoryArtworkFile(uri);
    expect(state.files.has(first.uri)).toBe(false);
  });

  it('uses fetch when the native downloader fails', async () => {
    state.nativeFailure = true;
    const image = new Uint8Array([0xff, 0xd8, 0xff, ...Array(123).fill(1), 0xff, 0xd9]);
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn(async () => ({ ok: true, arrayBuffer: async () => image.buffer })) as unknown as typeof fetch;
    try {
      const file = await ensureStoryArtworkFile('https://cdn.example.com/scene.jpg');
      expect(file.exists).toBe(true);
      expect(state.downloads).toBe(1);
      expect(globalThis.fetch).toHaveBeenCalledOnce();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
