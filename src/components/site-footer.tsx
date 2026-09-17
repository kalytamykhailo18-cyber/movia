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
      <div className="mx-auto w-full max-w-[1200px] px-4 py-12 md:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm space-y-4">
            {/* No existe version clara del logo entre los archivos suministrados
                y el manual la exige para fondos oscuros. El filtro devuelve la
                forma exacta en blanco sin redibujar la M, que es lo que prohibe
                la seccion 2. Sustituir en cuanto llegue el archivo claro. */}
            <img
              src="/brand/logo-web.png"
              alt={env.ui.brandName}
              width={115}
              height={80}
              className="h-11 w-auto [filter:brightness(0)_invert(1)]"
            />
            <p className="text-[14px] text-[var(--color-navy-muted)]">{env.ui.brandClaim}</p>
          </div>

          <nav aria-label="Pie de pagina">
            <h2 className="movia-etiqueta mb-2 text-white">Navegacion</h2>
            <ul>
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-[44px] items-center text-[14px] text-[var(--color-navy-muted)] transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-[var(--color-navy-line)] pt-6 text-[12px] text-[var(--color-navy-muted)]">
          <span>
            {env.ui.brandName} - {env.locale.countryName}
          </span>
          <span>
            Precios en {env.locale.currency} con {env.tax.label} incluido
          </span>
        </div>
      </div>
    </footer>
  )
}
