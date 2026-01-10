import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.gallardcode.evlogger',
  appName: 'EVLogger',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      androidScaleType: 'CENTER_CROP',
    },
  },
};

export default config;
