const os = require('node:os');

try {
  os.userInfo();
} catch {
  os.userInfo = () => ({
    uid: -1,
    gid: -1,
    username: process.env.USERNAME || process.env.USER || 'e2e',
    homedir: process.env.USERPROFILE || process.env.HOME || process.cwd(),
    shell: null,
  });
}
