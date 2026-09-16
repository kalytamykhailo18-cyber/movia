import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { env } from '@/lib/env'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ServiceWorker } from '@/components/service-worker'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: {
    default: `${env.ui.brandName} - Marketplace de activos empresariales`,
    template: `%s | ${env.ui.brandName}`,
  },
  description: env.ui.brandClaim,
  manifest: '/manifest.webmanifest',
  applicationName: env.ui.brandName,
  appleWebApp: { capable: true, statusBarStyle: 'default', title: env.ui.brandName },
  icons: {
    icon: [
      { url: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/brand/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/brand/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    siteName: env.ui.brandName,
    locale: env.locale.locale,
  },
}

export const viewport: Viewport = {
  themeColor: '#111827',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={env.locale.locale.split('-')[0]} className={inter.variable}>
      <body className="flex min-h-dvh flex-col bg-[var(--color-background)] antialiased">
        <ServiceWorker enabled={env.pwa.enabled} />
        <SiteHeader />
        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 pb-16 pt-6 md:px-6">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}
