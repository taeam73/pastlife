import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildStaticAssets } from './build-static-assets.mjs';

test('builds a deterministic Cloudflare Pages asset directory', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'pastlife-assets-'));
  const source = path.join(root, 'source');
  const output = path.join(root, 'output');
  try {
    await mkdir(path.join(source, 'stories'), { recursive: true });
    await writeFile(path.join(source, 'stories', 'sample image.jpg'), 'pastlife');
    const manifest = await buildStaticAssets({ source, output, version: 'test-version' });

    assert.equal(manifest.count, 1);
    assert.equal(manifest.assets['asset://stories/sample image.jpg'].path, '/assets/stories/sample image.jpg');
    assert.match(manifest.assets['asset://stories/sample image.jpg'].sha256, /^[a-f0-9]{64}$/u);
    assert.equal(await readFile(path.join(output, 'assets', 'stories', 'sample image.jpg'), 'utf8'), 'pastlife');
    assert.deepEqual(JSON.parse(await readFile(path.join(output, 'health.json'), 'utf8')), {
      status: 'ok', version: 'test-version', count: 1,
    });
    assert.match(await readFile(path.join(output, '_headers'), 'utf8'), /max-age=31536000, immutable/u);
    assert.match(await readFile(path.join(output, 'privacy', 'index.html'), 'utf8'), /gysoft@gimmyoung\.com/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
