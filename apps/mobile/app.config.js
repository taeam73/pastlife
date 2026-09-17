const base = require('./app.json');

const androidPackage = process.env.EXPO_PUBLIC_ANDROID_PACKAGE || 'com.pastlife.archive';
const appLinkHost = process.env.EXPO_PUBLIC_APP_LINK_HOST;

module.exports = {
  ...base.expo,
  android: {
    ...(base.expo.android || {}),
    package: androidPackage,
    ...(appLinkHost ? {
      intentFilters: [{
        action: 'VIEW',
        autoVerify: true,
        data: [{ scheme: 'https', host: appLinkHost, pathPrefix: '/s' }],
        category: ['BROWSABLE', 'DEFAULT'],
      }],
    } : {}),
  },
};
