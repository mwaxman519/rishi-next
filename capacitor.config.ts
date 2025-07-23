import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.rishi.platform',
  appName: 'Rishi Platform',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    App: {
      launchAutoHide: false
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a1a',
      showSpinner: true,
      spinnerColor: '#ffffff'
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1a1a1a'
    },
    Keyboard: {
      resize: 'ionic'
    },
    LocalNotifications: {
      iconColor: '#1a1a1a'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
