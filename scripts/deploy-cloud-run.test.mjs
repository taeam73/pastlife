import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Cloud Run keeps one production instance warm and lets development scale to zero', async () => {
  const source = await readFile(new URL('./deploy-cloud-run.ps1', import.meta.url), 'utf8');
  assert.match(source, /\$minInstances\s*=\s*if\s*\(\$Environment\s*-eq\s*'prod'\)\s*\{\s*'1'\s*\}\s*else\s*\{\s*'0'\s*\}/u);
  assert.match(source, /"--min-instances=\$minInstances"/u);
  assert.doesNotMatch(source, /'--min-instances=0'/u);
});
