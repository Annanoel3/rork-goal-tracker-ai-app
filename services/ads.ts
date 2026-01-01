import { Platform } from 'react-native';

export const AD_UNIT_IDS = {
  banner: Platform.select({
    ios: __DEV__ ? 'ca-app-pub-3940256099942544/2934735716' : 'YOUR_IOS_BANNER_ID',
    android: __DEV__ ? 'ca-app-pub-3940256099942544/6300978111' : 'YOUR_ANDROID_BANNER_ID',
    default: 'ca-app-pub-3940256099942544/2934735716',
  }) as string,
  interstitial: Platform.select({
    ios: __DEV__ ? 'ca-app-pub-3940256099942544/4411468910' : 'YOUR_IOS_INTERSTITIAL_ID',
    android: __DEV__ ? 'ca-app-pub-3940256099942544/1033173712' : 'YOUR_ANDROID_INTERSTITIAL_ID',
    default: 'ca-app-pub-3940256099942544/4411468910',
  }) as string,
};

export const initializeAds = async () => {
  console.log('Ads initialized (production build required for real ads)');
};

export const showInterstitialAd = async () => {
  console.log('Interstitial ad shown (production build required)');
};
