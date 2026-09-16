import type { MetadataRoute } from 'next'
import { env } from '@/lib/env'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${env.ui.brandName} - Marketplace de activos empresariales`,
    short_name: env.ui.brandName,
    description: env.ui.brandClaim,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#111827',
    lang: env.locale.locale,
    categories: ['business', 'shopping'],
    icons: [
      { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/brand/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Publicar un activo', url: '/publicar' },
      { name: 'Buscar activos', url: '/buscar' },
      { name: 'Mi Empresa', url: '/mi-empresa' },
    ],
  }
}
