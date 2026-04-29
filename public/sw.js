const CACHE = 'codalia-v1'

const STATIC = [
  '/',
  '/courses',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

// Instalar — precachear páginas clave
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  )
})

// Activar — limpiar caches viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

// Fetch — estrategia por tipo de recurso
self.addEventListener('fetch', e => {
  const { request } = e
  const url = new URL(request.url)

  // Solo manejar mismo origen + CDN de Pyodide
  const isPyodide = url.hostname === 'cdn.jsdelivr.net' && url.pathname.includes('pyodide')
  if (url.origin !== location.origin && !isPyodide) return

  // Assets estáticos (_next/static, icons, imágenes) → CacheFirst
  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/icons') ||
    url.pathname.match(/\.(png|jpg|svg|woff2?|ico)$/) ||
    isPyodide
  ) {
    e.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(res => {
        const clone = res.clone()
        caches.open(CACHE).then(c => c.put(request, clone))
        return res
      }))
    )
    return
  }

  // API → NetworkFirst (datos siempre frescos)
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(request).catch(() => caches.match(request))
    )
    return
  }

  // Páginas → StaleWhileRevalidate
  e.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request).then(res => {
        caches.open(CACHE).then(c => c.put(request, res.clone()))
        return res
      })
      return cached || network
    })
  )
})
