import Link from 'next/link'
import { env } from '@/lib/env'
import { getSessionUser } from '@/lib/auth'

function enlaces(haySesion: boolean) {
  return [
    { href: '/buscar', label: 'Buscar activos' },
    { href: '/categorias', label: 'Categorias' },
    { href: haySesion ? '/publicar' : '/ingresar?destino=%2Fpublicar', label: 'Publicar' },
    { href: '/planes', label: 'Planes y precios' },
  ]
}

export async function SiteFooter() {
  const user = await getSessionUser()
  const LINKS = enlaces(Boolean(user))
  return (
    <footer className="bg-[var(--color-navy)]" data-testid="site-footer">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-12 md:flex-row md:items-start md:justify-between md:px-6">
        <div className="max-w-sm space-y-4">
          {/* El archivo maestro lleva el wordmark en navy, asi que sobre fondo
              oscuro se presenta sobre una superficie clara en lugar de alterarlo. */}
          <span className="inline-flex rounded-[var(--radius-input)] bg-white px-3 py-2">
            <img
              src="/brand/logo-web.png"
              alt={env.ui.brandName}
              width={115}
              height={80}
              className="h-10 w-auto"
            />
          </span>
          <p className="text-[14px] text-white/70">{env.ui.brandClaim}</p>
        </div>

        <nav className="flex flex-col gap-1" aria-label="Pie de pagina">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-[44px] items-center text-[14px] text-white/80 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-[12px] text-white/60">
          {env.ui.brandName} - {env.locale.countryName}
        </p>
      </div>
    </footer>
  )
}
