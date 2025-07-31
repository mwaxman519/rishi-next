import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rishiplatform.staging',
  appName: 'Rishi Platform Staging',
  webDir: 'www',
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;