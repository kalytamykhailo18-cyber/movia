import Link from 'next/link'
import { env } from '@/lib/env'

const LINKS = [
  { href: '/buscar', label: 'Buscar activos' },
  { href: '/categorias', label: 'Categorias' },
  { href: '/publicar', label: 'Publicar' },
  { href: '/planes', label: 'Planes y precios' },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-white">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-10 md:flex-row md:items-start md:justify-between md:px-6">
        <div className="max-w-sm space-y-3">
          <img src="/brand/logo.png" alt={env.ui.brandName} className="h-10 w-auto" />
          <p className="text-[14px] text-[var(--color-text-muted)]">{env.ui.brandClaim}</p>
        </div>

        <nav className="flex flex-col gap-2" aria-label="Pie de pagina">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[14px] text-[var(--color-navy)] hover:text-[var(--color-primary)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-[12px] text-[var(--color-text-muted)]">
          {env.ui.brandName} - {env.locale.countryName}
        </p>
      </div>
    </footer>
  )
}
