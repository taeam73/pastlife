import { createHash } from 'node:crypto';
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function walk(directory, root = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute, root));
    else if (entry.isFile()) files.push(path.relative(root, absolute).split(path.sep).join('/'));
  }
  return files;
}

export async function buildStaticAssets({
  source = path.join(repositoryRoot, 'apps/mobile/assets'),
  output = path.join(repositoryRoot, 'dist/static'),
  version = process.env.CONTENT_VERSION ?? '3.0.0',
} = {}) {
  await rm(output, { recursive: true, force: true });
  await mkdir(path.join(output, 'assets'), { recursive: true });
  await cp(source, path.join(output, 'assets'), { recursive: true });
  await mkdir(path.join(output, 'privacy'), { recursive: true });
  await cp(path.join(repositoryRoot, 'scripts/static-pages/privacy/index.html'), path.join(output, 'privacy/index.html'));

  const files = await walk(source);
  const assets = {};
  let totalBytes = 0;
  for (const relativePath of files) {
    const absolute = path.join(source, ...relativePath.split('/'));
    const bytes = await readFile(absolute);
    const details = await stat(absolute);
    totalBytes += details.size;
    assets[`asset://${relativePath}`] = {
      path: `/assets/${relativePath}`,
      bytes: details.size,
      sha256: createHash('sha256').update(bytes).digest('hex'),
    };
  }

  const generatedAt = new Date().toISOString();
  const manifest = { version, generatedAt, count: files.length, totalBytes, assets };
  await writeFile(path.join(output, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(path.join(output, 'health.json'), `${JSON.stringify({ status: 'ok', version, count: files.length })}\n`);
  await writeFile(path.join(output, '_headers'), [
    '/assets/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '  Access-Control-Allow-Origin: *',
    '',
    '/manifest.json',
    '  Cache-Control: public, max-age=300',
    '  Access-Control-Allow-Origin: *',
    '',
    '/health.json',
    '  Cache-Control: no-store',
    '',
    '/privacy/*',
    '  Cache-Control: public, max-age=300',
    '',
  ].join('\n'));
  return manifest;
}

function optionValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const manifest = await buildStaticAssets({
    source: optionValue('--source'),
    output: optionValue('--output'),
  });
  console.log(`Prepared ${manifest.count} static assets (${manifest.totalBytes} bytes).`);
}
