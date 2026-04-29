import type { NextConfig } from 'next'
// @ts-ignore — next-pwa no tiene tipos para ESM
import withPWA from 'next-pwa'

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',   // no SW en dev
  runtimeCaching: [
    // Páginas — StaleWhileRevalidate
    {
      urlPattern: /^https?:\/\/.*\/(courses|playground|profile).*/i,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'pages-cache', expiration: { maxEntries: 50 } },
    },
    // API quiz (JSON estático) — CacheFirst
    {
      urlPattern: /\/api\/quiz\//,
      handler: 'CacheFirst',
      options: { cacheName: 'quiz-cache', expiration: { maxEntries: 200 } },
    },
    // Imágenes y assets estáticos — CacheFirst
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff2?)$/i,
      handler: 'CacheFirst',
      options: { cacheName: 'assets-cache', expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 } },
    },
    // CDN de Pyodide — CacheFirst (son ~10 MB, vale la pena cachear)
    {
      urlPattern: /cdn\.jsdelivr\.net\/pyodide\//,
      handler: 'CacheFirst',
      options: { cacheName: 'pyodide-cache', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 } },
    },
  ],
})

const nextConfig: NextConfig = {
  // Headers para Pyodide (WASM necesita COOP/COEP para SharedArrayBuffer)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy',   value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy',  value: 'require-corp' },
          { key: 'Cross-Origin-Resource-Policy',  value: 'cross-origin' },
        ],
      },
    ]
  },
}

export default pwaConfig(nextConfig)
