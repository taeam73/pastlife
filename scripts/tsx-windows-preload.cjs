// Inherited by tsx child processes through NODE_OPTIONS.
if (process.platform === 'win32' && typeof process.geteuid !== 'function') {
  process.geteuid = () => 0;
}
