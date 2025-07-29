import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rishiplatform.staging',
  appName: 'Rishi Platform',
  webDir: '.next', // Point to Next.js build output
  
  // CRITICAL: Live server connection - NO static export
  server: {
    url: 'https://rishi-staging.replit.app', // Live backend with full functionality
    cleartext: false,
    androidScheme: 'https',
    allowNavigation: [
      'https://rishi-staging.replit.app',
      'https://accounts.google.com', // OAuth
      'https://maps.googleapis.com', // Google Maps
    ],
  },
  
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#7c3aed", // Rishi purple brand
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      spinnerStyle: "small",
      spinnerColor: "#ffffff",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#7c3aed", // Rishi purple
    },
    Keyboard: {
      resize: "body",
      style: "dark",
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    App: {
      skipNativeInitialize: false
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#7c3aed",
    }
  },
  
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined, 
      keystorePassword: undefined,
      keystoreAliasPassword: undefined,
      releaseType: "APK",
      signingType: "jarsigner"
    },
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  
  ios: {
    scheme: "Rishi Platform",
    allowsLinkPreview: false,
    handleApplicationNotifications: true,
  }
};

export default config;