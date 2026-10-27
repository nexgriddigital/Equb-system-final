import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.equbdraw.app',
  appName: 'Equb Draw',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    minWebViewVersion: 60,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#0E3B2E',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      backgroundColor: '#0E3B2E',
      style: 'DARK',
    },
  },
};

export default config;
