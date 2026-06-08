import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.js',
      includeAssets: ['favicon.svg', 'jv-logo.png', 'hero-photo.JPEG', 'disco-ball-watermark.svg', 'robots.txt'],
      manifest: {
        name: 'Vi & Jay Wedding HQ',
        short_name: 'Wedding HQ',
        description: 'A mobile-first wedding planning app for Vi & Jay.',
        start_url: '.',
        display: 'standalone',
        theme_color: '#5C1A2E',
        background_color: '#FDF6F0',
        icons: [
          { src: '/jv-logo.png', sizes: '192x192', type: 'image/png' },
          { src: '/jv-logo.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      // injectManifest options (these apply when strategies: 'injectManifest')
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // icon.png is 3MB — exclude from precache to stay under the 2MB limit
        globIgnores: ['**/icon.png'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
      },
      // devOptions.enabled: false — disables the secondary SW sub-build in dev mode.
      // With Vite 8 (rolldown), the injectManifest sub-build crashes the dev server.
      // The service worker is only needed in production; disabling in dev is correct.
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    port: 5173,
    strictPort: false, // increment port if 5173 is taken rather than exit
    proxy: {
      '/api': 'http://localhost:4174',
    },
  },
})
