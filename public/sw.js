const VERSION = 'movia-v1'
const SHELL = `${VERSION}-shell`
const RUNTIME = `${VERSION}-runtime`
const OFFLINE_URL = '/offline'

const OPTIONAL = ['/brand/logo-web.png', '/brand/icon-192.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL)
      // La pagina sin conexion es obligatoria; el resto es mejor esfuerzo,
      // un asset que falle no debe dejar la instalacion a medias.
      await cache.add(OFFLINE_URL)
      await Promise.allSettled(OPTIONAL.map((url) => cache.add(url)))
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request)
        } catch {
          const cached = (await caches.match(request)) ?? (await caches.match(OFFLINE_URL))
          return (
            cached ??
            new Response('Sin conexion', {
              status: 503,
              headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            })
          )
        }
      })(),
    )
    return
  }

  const isAsset =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/brand/') ||
    /\.(css|js|woff2?|png|jpg|jpeg|svg|webp)$/.test(url.pathname)

  if (!isAsset) return

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone()
          caches.open(RUNTIME).then((cache) => cache.put(request, copy))
        }
        return response
      })
    }),
  )
})
