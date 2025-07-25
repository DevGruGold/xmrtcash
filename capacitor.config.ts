import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d888ca073f5b448f9e4bc361fefec90e',
  appName: 'xmrtcash',
  webDir: 'dist',
  server: {
    url: "https://d888ca07-3f5b-448f-9e4b-c361fefec90e.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a1a",
      showSpinner: false,
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#1a1a1a"
    }
  }
};

export default config;