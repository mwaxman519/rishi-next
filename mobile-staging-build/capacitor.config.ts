import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rishiplatform.staging',
  appName: 'Rishi Platform (Staging)',
  webDir: 'out',
  server: {
    url: 'https://rishi-staging.replit.app',
    cleartext: false
  },
  plugins: {
    App: {
      launchShowDuration: 3000
    },
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#7c3aed",
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: "#7c3aed"
    },
    Keyboard: {
      resize: 'body'
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#7c3aed"
    }
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true
  }
};

export default config;
