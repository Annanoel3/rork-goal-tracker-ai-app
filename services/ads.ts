import { Platform } from 'react-native';

export const initializeAds = async () => {
  if (__DEV__ || Platform.OS === 'web') {
    console.log('Ad initialization skipped in dev/web mode');
    return true;
  }

  console.log('Ads configured. Real ads require production build with react-native-google-mobile-ads.');
  console.log('To implement: npm install react-native-google-mobile-ads');
  console.log('And configure AdMob App IDs in app.json');
  return true;
};

export const ADS_CONFIG = {
  BANNER_AD_UNIT_ID: __DEV__ 
    ? Platform.select({
        ios: 'ca-app-pub-3940256099942544/2934735716',
        android: 'ca-app-pub-3940256099942544/6300978111',
        default: 'test-banner-ad'
      })
    : Platform.select({
        ios: process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID || '',
        android: process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID || '',
        default: ''
      }),
};
