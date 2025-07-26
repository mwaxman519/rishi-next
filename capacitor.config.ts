import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rishi.platform.staging',
  appName: 'Rishi Platform Staging',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    url: 'https://rishi-staging.replit.app'
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      releaseType: 'APK'
    }
  },
  ios: {
    scheme: 'Rishi Platform Staging'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a365d',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark'
    }
  }
};

export default config;
