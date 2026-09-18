import Link from 'next/link'
import { ArrowRight, BadgeCheck } from 'lucide-react'
import { env } from '@/lib/env'
import {
  getFeatured,
  getLatest,
  getCategories,
  getVerifiedCompanies,
  getFilterOptions,
} from '@/server/publications'
import { PublicationCard } from '@/components/publication-card'
import { HeroSearch } from '@/components/hero-search'
import { CategoryGrid } from '@/components/category-grid'
import { AnimatedSection } from '@/components/animated-section'
import { parseJson } from '@/lib/utils'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [featured, latest, categories, companies, opciones, totalActivos, totalEmpresas] =
    await Promise.all([
      getFeatured(4),
      getLatest(8),
      getCategories(),
      getVerifiedCompanies(4),
      // Ya existia para /buscar. La entrada la reutiliza para que sus cuatro
      // desplegables filtren de verdad, con los mismos parametros.
      getFilterOptions(),
      db.publication.count({ where: { status: 'active' } }),
      db.company.count({ where: { verificationStatus: 'approved' } }),
    ])

  return (
    // 32 px entre secciones en vez de 48: sostiene mejor un catalogo denso.
    <div className="space-y-8 md:space-y-12">
      <HeroSearch
        activos={totalActivos}
        empresas={totalEmpresas}
        categorias={categories}
        ciudades={opciones.cities}
        condiciones={opciones.conditions}
        ultima={latest[0]}
      />

      <AnimatedSection>
        <SectionHeading
          epigrafe={`${totalActivos} activos publicados en ${categories.length} categorías`}
          title="Categorías"
          href="/categorias"
          linkLabel="Ver todas"
        />
        <CategoryGrid categories={categories} />
      </AnimatedSection>

      {featured.length ? (
        <AnimatedSection>
          <SectionHeading
            epigrafe="Visibilidad contratada"
            title="Activos destacados"
            href="/buscar?sort=featured"
            linkLabel="Ver más"
          />
          {/* Formato apaisado y el doble de superficie: es lo que se compra al
              contratar una publicacion destacada. */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2" data-testid="featured-grid">
            {featured.map((item, i) => (
              <PublicationCard key={item.id} item={item} index={i} variante="destacada" />
            ))}
          </div>
        </AnimatedSection>
      ) : null}

      <AnimatedSection>
        <SectionHeading
          epigrafe="Lo más reciente del catálogo"
          title="Últimas publicaciones"
          href="/buscar"
          linkLabel="Ver todas"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="latest-grid">
          {latest.map((item, i) => (
            <PublicationCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection>
        <SectionHeading
          epigrafe="Identidad validada con NIT y Cámara de Comercio"
          title="Empresas verificadas"
          href="/empresas"
          linkLabel="Ver todas"
        />
        {/* Directorio, no catalogo: filas con la cifra que importa a la
            derecha, en vez de cuatro tarjetas con el parrafo recortado. */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2" data-testid="companies-grid">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/empresa/${company.id}`}
              className="flex items-center gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-[var(--pad-card)] transition-[border-color,box-shadow] duration-200 hover:border-[#BFDBFE] hover:shadow-[var(--shadow-card-hover)]"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-input)] bg-[var(--color-navy)] text-[18px] font-bold text-white">
                {iniciales(company.name)}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[16px] font-semibold text-[var(--color-navy)]">
                    {company.name}
                  </span>
                  <BadgeCheck className="size-4 shrink-0 text-[var(--color-primary)]" aria-hidden />
                </span>
                <span className="mt-0.5 block truncate text-[12px] text-[var(--color-text-muted)]">
                  {company.city?.name}
                  {company.description ? ` · ${company.description}` : ''}
                </span>
                <span className="mt-2 flex flex-wrap gap-1">
                  {/* El sello de verificacion ya va junto al nombre, asi que
                      el distintivo "Verificada" repetiria el dato. */}
                  {parseJson<string[]>(company.badges, [])
                    .filter((b) => b !== 'verified')
                    .slice(0, 2)
                    .map((b) => (
                    <span
                      key={b}
                      className="inline-flex h-6 items-center rounded-full bg-[var(--color-verified-soft)] px-2 text-[length:var(--text-label)] font-semibold tracking-[0.04em] text-[#1E40AF]"
                    >
                      {b === 'top_seller' ? 'Top seller' : b === 'fast_response' ? 'Respuesta rapida' : 'Anos en MOVIA'}
                    </span>
                    ))}
                </span>
              </span>

              <span className="w-24 shrink-0 text-right">
                <strong className="block text-[20px] font-bold leading-none tabular-nums text-[var(--color-navy)]">
                  {company._count.publications}
                </strong>
                <span className="movia-etiqueta mt-1">Publicaciones activas</span>
              </span>
            </Link>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection>
        {/* Cierra como abre: navy de borde a borde. Una tarjeta navy redondeada
            justo encima de un pie navy volvia a partir en dos una misma masa
            de color. */}
        <div className="movia-sangrado relative -mb-16 overflow-hidden bg-[var(--color-navy)] px-6 py-16 text-center md:px-12 md:py-20">
          <h2 className="text-[24px] font-bold tracking-[var(--tracking-tight)] text-white md:text-[28px]">
            ¿Tienes equipo parado?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[16px] text-[var(--color-navy-muted)]">
            Publícalo hoy y empieza a recibir contactos de empresas que lo están buscando en{' '}
            {env.locale.countryName}.
          </p>
          <Link
            href="/publicar"
            className="mt-6 inline-flex min-h-[52px] items-center gap-2 rounded-[var(--radius-input)] bg-[var(--color-primary)] px-6 text-[16px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)]"
          >
            Publicar un activo
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </AnimatedSection>
    </div>
  )
}

function iniciales(nombre: string) {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('')
}

// La cabecera de seccion de la maqueta: filete azul de 4 px abarcando el
// bloque entero, epigrafe encima del titulo en mayuscula tecnica y una linea
// fina cerrando la fila. El epigrafe iba debajo del titulo, como parrafo
// suelto, que es justo lo que impedia leer la seccion como una seccion.
function SectionHeading({
  epigrafe,
  title,
  href,
  linkLabel,
}: {
  epigrafe?: string
  title: string
  href: string
  linkLabel: string
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 border-b border-[var(--color-border)] pb-3">
      <div className="relative min-w-0 pl-4">
        <span aria-hidden className="absolute inset-y-[3px] left-0 w-1 rounded-full bg-[var(--color-primary)]" />
        {epigrafe ? <span className="movia-etiqueta">{epigrafe}</span> : null}
        <h2 className="mt-2 text-[24px] font-semibold leading-tight tracking-[var(--tracking-tight)] text-[var(--color-navy)] md:text-[28px]">
          {title}
        </h2>
      </div>
      <Link
        href={href}
        className="inline-flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap text-[14px] font-semibold text-[var(--color-primary)] transition-colors hover:text-[var(--color-primary-hover)]"
      >
        {linkLabel}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  )
}
