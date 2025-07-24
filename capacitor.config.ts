import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rishi.platform.dev',
  appName: 'Rishi Platform Dev',
  webDir: 'out',
  // Remove server configuration to use local static files
  // The app will load from the local 'out' directory instead of remote server
  plugins: {
    App: {
      launchAutoHide: false
    },
    SplashScreen: {
      launchShowDuration: 1000,
      backgroundColor: '#1a1a1a',
      showSpinner: true,
      spinnerColor: '#ffffff'
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1a1a1a'
    },
    Keyboard: {
      resizeOnFullScreen: true
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