import Link from 'next/link'
import { env } from '@/lib/env'
import { getSessionUser } from '@/lib/auth'

// Todo plano tecnico termina en su cajetin: la casilla rotulada que recoge
// proyecto, escala, fecha y hoja. El pie hace de cajetin de la pagina. Antes
// era la marca a la izquierda y una sola columna de enlaces a la derecha, con
// mil doscientos pixeles de hueco en medio; ahora son casillas rotuladas
// separadas por filete, que es lo que llena el ancho con algo que se lee.
function columnas(haySesion: boolean) {
  return [
    {
      titulo: 'Catalogo',
      enlaces: [
        { href: '/buscar', label: 'Buscar activos' },
        { href: '/categorias', label: 'Categorias' },
        { href: '/empresas', label: 'Empresas verificadas' },
      ],
    },
    {
      titulo: 'Vender',
      enlaces: [
        { href: haySesion ? '/publicar' : '/ingresar?destino=%2Fpublicar', label: 'Publicar un activo' },
        { href: haySesion ? '/publicar/masivo' : '/ingresar?destino=%2Fpublicar%2Fmasivo', label: 'Carga masiva' },
        { href: '/planes', label: 'Planes y precios' },
      ],
    },
    haySesion
      ? {
          titulo: 'Cuenta',
          enlaces: [
            { href: '/mi-empresa', label: 'Mi empresa' },
            { href: '/mensajes', label: 'Mensajes' },
            { href: '/favoritos', label: 'Favoritos' },
          ],
        }
      : {
          titulo: 'Cuenta',
          enlaces: [
            { href: '/ingresar', label: 'Ingresar' },
            { href: '/registro', label: 'Crear cuenta' },
            { href: '/favoritos', label: 'Favoritos' },
          ],
        },
  ]
}

export async function SiteFooter() {
  const user = await getSessionUser()
  const COLUMNAS = columnas(Boolean(user))

  return (
    <footer
      className="border-t border-[var(--color-navy-line)] bg-[var(--color-navy)]"
      data-testid="site-footer"
    >
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-6">
        {/* Las casillas se separan con filete, no con hueco. En telefono el
            cajetin se apila y el filete pasa a horizontal. */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div className="border-b border-[var(--color-navy-line)] py-8 pr-8 sm:col-span-3 lg:col-span-1 lg:border-b-0 lg:border-r">
            {/* El archivo lleva el wordmark en navy, asi que sobre fondo oscuro
                va sobre placa clara. Nunca con filtro: recolorear la marca es
                un uso incorrecto segun la seccion 3 del manual. Aqui si hay
                sitio, asi que va el lockup completo y la palabra se lee. */}
            <span className="inline-flex rounded-[var(--radius-input)] bg-white p-3">
              <img
                src="/brand/logo-web.png"
                alt={env.ui.brandName}
                width={115}
                height={80}
                className="h-[52px] w-auto"
              />
            </span>
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-[var(--color-navy-muted)]">
              {env.ui.brandClaim}
            </p>
          </div>

          {COLUMNAS.map((col, i) => (
            <nav
              key={col.titulo}
              aria-label={col.titulo}
              className={[
                'py-8 lg:px-8',
                'border-b border-[var(--color-navy-line)] sm:border-b-0',
                i < COLUMNAS.length - 1 ? 'sm:border-r sm:border-[var(--color-navy-line)] sm:pr-6 sm:pl-0' : '',
                i > 0 ? 'sm:pl-6' : '',
              ].join(' ')}
            >
              <h2 className="movia-etiqueta text-white">{col.titulo}</h2>
              <ul className="mt-1">
                {col.enlaces.map((link) => (
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
          ))}
        </div>

        {/* La linea de cierre del cajetin: de donde es el precio y en que
            moneda, que es lo que un comprador necesita saber sin preguntar. */}
        <div className="flex flex-wrap justify-between gap-3 border-t border-[var(--color-navy-line)] py-6 text-[length:var(--text-label)] uppercase tracking-[var(--tracking-label)] text-[var(--color-navy-muted)]">
          <span>
            {env.ui.brandName} - {env.locale.countryName}
          </span>
          {/* Sin "con": la pagina de planes declara su propia frase con esa
              misma forma, y dos textos identicos en la misma pantalla dejaban
              ambigua la comprobacion de que los planes anuncian el impuesto.
              La coma tambien lee mejor en una linea de cajetin. */}
          <span>
            Precios en {env.locale.currency}, {env.tax.label} incluido
          </span>
        </div>
      </div>
    </footer>
  )
}
