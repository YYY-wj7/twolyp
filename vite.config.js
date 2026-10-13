import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// PWA: manifest + service worker are in public/ (manual approach).
// vite-plugin-pwa's workbox fails on paths with single quotes (Windows username Yy'y),
// so we use a hand-written sw.js and manifest.webmanifest instead.

export default defineConfig({
  base: '/twolyp/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    host: true,
  },
})
