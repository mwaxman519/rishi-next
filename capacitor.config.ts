import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rishi.platform.dev',
  appName: 'Rishi Platform Dev',
  webDir: 'out',
  server: {
    // Points to Replit development server
    url: 'https://3517da39-7603-40ea-b364-fdfd91837371-00-33fp2yev8yflw.spock.replit.dev',
    cleartext: true,
    allowNavigation: [
      'https://3517da39-7603-40ea-b364-fdfd91837371-00-33fp2yev8yflw.spock.replit.dev',
      'https://*.spock.replit.dev'
    ]
  },
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