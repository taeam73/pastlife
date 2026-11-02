import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('./deploy.ps1', import.meta.url), 'utf8');

test('assets-only deployment skips Cloud Run and still verifies Cloudflare', () => {
  assert.match(source, /\[switch\]\$AssetsOnly/u);
  assert.match(source, /if \(\$Environment -eq 'dev' -or \$AssetsOnly\) \{ \$env:USE_MOCK_GOOGLE = 'true' \}/u);
  assert.match(source, /if \(\$AssetsOnly\) \{[\s\S]*Wait-ForUrl 'Cloudflare assets' \$assetHealth[\s\S]*return[\s\S]*\}/u);

  const assetsOnlyBranch = source.match(/if \(\$AssetsOnly\) \{([\s\S]*?)\n\s*\}/u)?.[1] ?? '';
  assert.doesNotMatch(assetsOnlyBranch, /deploy-cloud-run\.ps1/u);
  assert.doesNotMatch(assetsOnlyBranch, /Wait-ForUrl 'Cloud Run API'/u);
});
