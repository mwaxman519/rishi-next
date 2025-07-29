import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rishiplatform.app',
  appName: 'Rishi Platform',
  webDir: 'out',
  server: {
    // Production: Static app connecting to Vercel serverless backend
    url: 'https://rishi-platform.vercel.app',
    cleartext: true
  },
  plugins: {
    App: {
      launchUrl: 'https://rishi-platform.vercel.app'
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#7c3aed',
      sound: 'beep.wav'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#7c3aed',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#7c3aed'
    }
  }
};

export default config;