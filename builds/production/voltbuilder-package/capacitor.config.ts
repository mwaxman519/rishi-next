const config = {
  appId: 'com.rishi.platform.production',
  appName: 'Rishi Platform',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    allowNavigation: ['https://rishi-next.vercel.app']
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK'
    }
  },
  plugins: {
    Browser: {
      presentationStyle: 'fullscreen'
    },
    StatusBar: {
      style: 'default',
      backgroundColor: '#ffffff'
    }
  }
};

export default config;