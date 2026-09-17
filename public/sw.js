const VERSION = 'movia-v1'
const SHELL = `${VERSION}-shell`
const RUNTIME = `${VERSION}-runtime`
const OFFLINE_URL = '/offline'

const OPTIONAL = ['/brand/logo-web.png', '/brand/icon-192.png']

const OFFLINE_FALLBACK = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sin conexion</title>
<style>
  body { margin:0; min-height:100dvh; display:flex; flex-direction:column; align-items:center;
         justify-content:center; gap:8px; font-family:Inter,Arial,sans-serif;
         background:#f8fafc; color:#111827; text-align:center; padding:24px; }
  img { width:64px; height:64px; }
  h1 { font-size:24px; margin:8px 0 0; }
  p { color:#6b7280; font-size:15px; max-width:22rem; margin:0; }
  a { margin-top:24px; min-height:44px; display:inline-flex; align-items:center; padding:0 20px;
      border-radius:8px; background:#2563eb; color:#fff; text-decoration:none; font-weight:600; font-size:14px; }
</style>
</head>
<body>
  <div data-testid="offline">
    <img src="/brand/icon-192.png" alt="MOVIA">
    <h1>Sin conexion</h1>
    <p>No pudimos cargar esta pagina. Revisa tu conexion e intenta de nuevo.</p>
    <a href="/">Volver al inicio</a>
  </div>
</body>
</html>`

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
          // Si la pagina sin conexion no alcanzo a quedar en cache, se responde
          // una equivalente incrustada: el usuario nunca ve un error del navegador.
          return cached ?? new Response(OFFLINE_FALLBACK, {
            status: 503,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          })
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
