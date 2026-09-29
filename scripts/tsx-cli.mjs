// tsx identifies its cache directory with process.geteuid() on POSIX and
// os.userInfo() on Windows. Some Windows/Node 24 environments fail the latter
// call with uv_os_get_passwd ENOMEM. Supplying the harmless numeric cache id
// keeps the normal tsx CLI (including watch mode) usable in those terminals.
if (process.platform === 'win32') {
  const { fileURLToPath } = await import('node:url');
  const preload = fileURLToPath(new URL('./tsx-windows-preload.cjs', import.meta.url));
  const requirePreload = `--require=${JSON.stringify(preload)}`;
  process.env.NODE_OPTIONS = [process.env.NODE_OPTIONS, requirePreload].filter(Boolean).join(' ');

  if (typeof process.geteuid !== 'function') {
    process.geteuid = () => 0;
  }
}

await import('tsx/cli');
