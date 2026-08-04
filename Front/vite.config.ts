import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Front runs on 5213, API on 5210. /api is proxied so the browser stays same-origin in dev.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'Reversi',
        short_name: 'Reversi',
        description: 'Reversi : jeu de plateau où tout peut basculer au dernier coup.',
        lang: 'fr',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait',
        background_color: '#0c1a13',
        theme_color: '#0c1a13',
        categories: ['games', 'board'],
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        navigateFallback: '/index.html',
        // The engine is on the server, so game calls are never served from the cache:
        // a stale board would be worse than an honest error.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
          },
        ],
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
