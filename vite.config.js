import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// On Windows with username containing single quote (Yy'y), vite-plugin-pwa's
// workbox fails to generate the service worker due to unescaped paths.
// Solution: detect the problematic path and skip SW generation locally.
// The PWA manifest still works. SW will be generated on Vercel (clean paths).
const hasProblematicPath = import.meta.url?.includes("'") ?? false

const pwaConfig = {
  registerType: 'autoUpdate',
  injectRegister: 'auto',
  includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
  manifest: {
    name: 'TwoLyp \u2014 Two of us, one garden',
    short_name: 'TwoLyp',
    description: 'Our private garden of memories',
    theme_color: '#D4A574',
    background_color: '#FDF6F0',
    display: 'standalone',
    orientation: 'portrait',
    scope: '/',
    start_url: '/',
    icons: [
      { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/api\.mapbox\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'mapbox-tiles',
          expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
    ],
  },
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // PWA plugin only active when path doesn't contain single quotes.
    // On Vercel (clean build paths), full PWA with service worker is enabled.
    ...(!hasProblematicPath ? [VitePWA(pwaConfig)] : []),
  ],
  server: {
    port: 5173,
    host: true,
  },
})
