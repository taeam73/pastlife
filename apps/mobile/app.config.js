const base = require('./app.json');

const androidPackage = process.env.EXPO_PUBLIC_ANDROID_PACKAGE || 'com.pastlife.archive';
const appLinkHost = process.env.EXPO_PUBLIC_APP_LINK_HOST;
const demoAdMobAppId = 'ca-app-pub-3940256099942544~3347511713';
const adMobAppId = process.env.EXPO_PUBLIC_ADMOB_APP_ID || demoAdMobAppId;

if (process.env.EAS_BUILD_PROFILE === 'production' &&
    (adMobAppId === demoAdMobAppId || !process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID ||
      !process.env.EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID || process.env.EXPO_PUBLIC_ADMOB_TEST_ADS === 'true')) {
  throw new Error('Production Android build requires live AdMob app and unit IDs');
}

module.exports = {
  ...base.expo,
  owner: 'gimmyoungsoft-apps',
  extra: {
    ...(base.expo.extra || {}),
    eas: { projectId: '0c442280-2dcf-4944-a94f-8ae4db951864' },
  },
  plugins: [
    ...(base.expo.plugins || []),
    ['react-native-google-mobile-ads', { androidAppId: adMobAppId }],
  ],
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
