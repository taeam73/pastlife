import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const vitest = resolve('node_modules/vitest/vitest.mjs');
const result = spawnSync(process.execPath, [vitest, 'run', 'apps/api/test/story-diversity-catalog.spec.ts'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: process.env,
});

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

console.log('Story diversity catalog satisfies the configured count and distribution gates.');
