import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const root = process.cwd();
const apiPort = process.env.E2E_API_PORT ?? '4000';
const mobilePort = process.env.E2E_MOBILE_PORT ?? '8081';
const adminPort = process.env.E2E_ADMIN_PORT ?? '3000';
const apiUrl = `http://127.0.0.1:${apiPort}/api/v1`;
const shim = `--require=${resolve(root, 'scripts/os-userinfo-shim.cjs').replaceAll('\\', '/')}`;
const servers = [];

function start(args, env, cwd = root) {
  const child = spawn(process.execPath, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: 'inherit',
    windowsHide: true,
  });
  servers.push(child);
  return child;
}

async function waitFor(url, child, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`E2E server exited before ${url} became ready`);
    try {
      await fetch(url);
      return;
    } catch {
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 500));
    }
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function stop(child) {
  if (child.exitCode !== null) return;
  child.kill('SIGTERM');
  await Promise.race([
    new Promise((resolveExit) => child.once('exit', resolveExit)),
    new Promise((resolveDelay) => setTimeout(resolveDelay, 5_000)),
  ]);
  if (child.exitCode === null) child.kill('SIGKILL');
}

let exitCode = 1;
try {
  const reuseServers = process.env.E2E_REUSE_SERVERS === '1';
  const skipAdmin = process.env.E2E_SKIP_ADMIN === '1';
  if (reuseServers) {
    await waitFor(`${apiUrl}/admin/content/summary`, { exitCode: null }, 10_000);
    await waitFor(`http://127.0.0.1:${mobilePort}`, { exitCode: null }, 10_000);
    if (!skipAdmin) await waitFor(`http://127.0.0.1:${adminPort}`, { exitCode: null }, 10_000);
  } else {
    const api = start(
      ['node_modules/tsx/dist/cli.mjs', '--tsconfig', 'apps/api/tsconfig.json', 'apps/api/src/main.ts'],
      { PORT: apiPort, USE_IN_MEMORY_DB: 'true', USE_MOCK_GOOGLE: 'true', ADMIN_TOKEN: 'e2e-admin-token', CONTENT_VERSION: process.env.E2E_CONTENT_VERSION ?? '2.5.0', NODE_OPTIONS: shim },
    );
    await waitFor(`${apiUrl}/admin/content/summary`, api, 120_000);

    const mobile = start(
      ['node_modules/expo/bin/cli', 'start', '--web', '--port', mobilePort],
      { CI: '1', EXPO_NO_TELEMETRY: '1', EXPO_PUBLIC_API_URL: apiUrl, EXPO_PUBLIC_USE_MOCK_GOOGLE: 'true', NODE_OPTIONS: shim },
      resolve(root, 'apps/mobile'),
    );
    await waitFor(`http://127.0.0.1:${mobilePort}`, mobile, 180_000);

    if (!skipAdmin) {
      const admin = start(
        ['node_modules/next/dist/bin/next', 'dev', '-p', adminPort],
        { NEXT_PUBLIC_API_URL: apiUrl, E2E_ADMIN_DIST_DIR: '.next-e2e' },
        resolve(root, 'apps/admin'),
      );
      await waitFor(`http://127.0.0.1:${adminPort}`, admin, 120_000);
    }
  }

  const playwright = spawn(
    process.execPath,
    ['node_modules/@playwright/test/cli.js', 'test', ...process.argv.slice(2).filter((arg) => arg !== '--')],
    { cwd: root, env: { ...process.env, MOBILE_BASE_URL: `http://127.0.0.1:${mobilePort}`, ADMIN_BASE_URL: `http://127.0.0.1:${adminPort}` }, stdio: 'inherit', windowsHide: true },
  );
  exitCode = await new Promise((resolveExit) => playwright.once('exit', (code) => resolveExit(code ?? 1)));
} finally {
  await Promise.all(servers.reverse().map(stop));
}

process.exitCode = exitCode;
