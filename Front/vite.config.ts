import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Front runs on 5213, API on 5210. /api is proxied so the browser stays same-origin in dev.
// PWA manifest, icons and iOS specifics are completed in lot 7.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Reversi',
        short_name: 'Reversi',
        lang: 'fr',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#12231b',
        theme_color: '#12231b',
      },
    }),
  ],
  server: {
    port: 5213,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5210',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5213,
    strictPort: true,
  },
})
