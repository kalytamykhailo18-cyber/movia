import type { Metadata } from 'next'
import Link from 'next/link'
import { env } from '@/lib/env'

export const metadata: Metadata = { title: 'Sin conexion' }

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center" data-testid="offline">
      <img src="/brand/icon-192.png" alt={env.ui.brandName} width={72} height={72} className="size-16" />
      <h1 className="mt-4 text-[24px] font-bold text-[var(--color-navy)]">Sin conexion</h1>
      <p className="mt-2 max-w-sm text-[15px] text-[var(--color-text-muted)]">
        No pudimos cargar esta pagina. Revisa tu conexion e intenta de nuevo.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-[44px] items-center rounded-[var(--radius-input)] bg-[var(--color-primary)] px-5 text-[14px] font-semibold text-white"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
