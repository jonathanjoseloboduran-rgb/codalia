import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Silenciar warning de Turbopack (Next.js 16)
  turbopack: {},

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

export default nextConfig
