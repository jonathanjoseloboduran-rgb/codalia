import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'app.codalia.mobile',
  appName: 'Codalia',
  // Bundlea el contenido de dist/ DENTRO del APK (offline, sin servidor remoto).
  webDir: 'dist',
  backgroundColor: '#0F172A',
  android: {
    backgroundColor: '#0F172A',
  },
}

export default config
