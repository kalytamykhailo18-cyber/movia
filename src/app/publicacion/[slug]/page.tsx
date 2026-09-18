import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ShieldCheck, FileText } from 'lucide-react'
import { env } from '@/lib/env'
import { parseJson } from '@/lib/utils'
import { money, shortDate } from '@/lib/format'
import { getPublicationBySlug, getSimilar } from '@/server/publications'
import { Gallery } from '@/components/gallery'
import { ContactPanel } from '@/components/contact-panel'
import { ViewTracker } from '@/components/view-tracker'
import { PublicationCard } from '@/components/publication-card'
import { VerifiedBadge, CompanyBadges, Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const pub = await getPublicationBySlug(slug)
  if (!pub) return { title: 'Publicacion no encontrada' }

  return {
    title: pub.title,
    description: pub.description?.slice(0, 160) ?? undefined,
    alternates: { canonical: `${env.app.url}/publicacion/${pub.slug}` },
    openGraph: {
      title: pub.title,
      description: pub.description?.slice(0, 160) ?? undefined,
      url: `${env.app.url}/publicacion/${pub.slug}`,
      images: parseJson<string[]>(pub.photos, []).slice(0, 1),
    },
  }
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Activa',
  sold: 'Vendida',
  withdrawn: 'Retirada',
  expired: 'Vencida',
  pending: 'Pendiente',
}

export default async function PublicationPage({ params }: Props) {
  const { slug } = await params
  const pub = await getPublicationBySlug(slug)
  if (!pub) notFound()

  const photos = parseJson<string[]>(pub.photos, [])
  const documents = parseJson<{ name: string; url: string }[]>(pub.documents, [])
  const specs = parseJson<Record<string, string | number>>(pub.specs, {})
  const attributes = pub.category.attributes
  const similar = await getSimilar(pub.id, pub.categoryId, 4)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: pub.title,
    description: pub.description,
    brand: pub.brand ? { '@type': 'Brand', name: pub.brand } : undefined,
    model: pub.model,
    image: photos,
    offers: {
      '@type': 'Offer',
      price: pub.price,
      priceCurrency: pub.currency,
      availability:
        pub.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: pub.company ? { '@type': 'Organization', name: pub.company.name } : undefined,
    },
  }

  const filas: { etiqueta: string; valor: string }[] = [
    ...Object.entries(specs).map(([key, value]) => {
      const attr = attributes.find((a) => a.key === key)
      return {
        etiqueta: attr?.label ?? key,
        valor: `${String(value)}${attr?.unit ? ` ${attr.unit}` : ''}`,
      }
    }),
    ...(pub.brand ? [{ etiqueta: 'Marca', valor: pub.brand }] : []),
    ...(pub.model ? [{ etiqueta: 'Modelo', valor: pub.model }] : []),
  ]

  return (
    <div className="space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewTracker publicationId={pub.id} />

      <nav className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--color-text-muted)]">
        <Link href="/" className="inline-flex min-h-[44px] items-center hover:text-[var(--color-primary)]">
          Inicio
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/buscar?category=${pub.category.slug}`}
          className="inline-flex min-h-[44px] items-center hover:text-[var(--color-primary)]"
        >
          {pub.category.name}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-[var(--color-navy)]">{pub.title}</span>
      </nav>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Gallery photos={photos} title={pub.title} />

          {/* Identidad del activo y cifras se leen como una sola pieza: el
              bloque navy arriba y los datos clave pegados debajo. El precio es
              lo que se compara entre publicaciones, asi que gana a la foto. */}
          <section>
            <div className="relative overflow-hidden rounded-t-[var(--radius-card)] bg-[var(--color-navy)] p-[var(--pad-panel)]">
              <img
                src="/brand/isotipo.png"
                alt=""
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-10 w-44 select-none opacity-[0.06]"
              />

              <div className="relative">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={pub.status === 'active' ? 'success' : 'neutral'}>
                    {STATUS_LABEL[pub.status] ?? pub.status}
                  </Badge>
                  {pub.featured ? <Badge tone="featured">Destacado</Badge> : null}
                  {pub.negotiable ? <Badge tone="neutral">Precio negociable</Badge> : null}
                </div>

                <h1 className="mt-3 text-[24px] font-bold leading-[1.15] tracking-[var(--tracking-display)] text-white md:text-[32px]">
                  {pub.title}
                </h1>

                <p
                  className="mt-4 text-[32px] font-bold leading-none tracking-[var(--tracking-display)] tabular-nums text-white md:text-[38px]"
                  data-testid="detail-price"
                >
                  {money(pub.price, pub.currency)}
                </p>
                <p className="mt-2 text-[12px] text-[var(--color-navy-muted)]">
                  {env.tax.includedInPrice ? `${env.tax.label} incluido` : `Mas ${env.tax.label}`}
                  {' · Publicado el '}
                  {shortDate(pub.publishedAt)}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-4 rounded-b-[var(--radius-card)] border border-t-0 border-[var(--color-border)] bg-white p-[var(--pad-panel)] sm:grid-cols-4">
              <Dato etiqueta="Ubicacion" valor={pub.city?.name ?? '-'} />
              <Dato etiqueta="Ano" valor={pub.year?.toString() ?? '-'} />
              <Dato
                etiqueta="Horas de uso"
                valor={pub.usageHours ? `${pub.usageHours.toLocaleString(env.locale.locale)} h` : '-'}
              />
              <Dato etiqueta="Condicion" valor={pub.condition ?? '-'} />
            </dl>
          </section>

          {pub.description ? (
            <Panel titulo="Descripcion">
              <p className="whitespace-pre-line text-[16px] leading-relaxed text-[var(--color-navy)]">
                {pub.description}
              </p>
            </Panel>
          ) : null}

          {filas.length ? (
            <Panel titulo="Ficha tecnica" testId="specs-section">
              {/* Es el contenido por el que existe la pagina. Tabla real, con
                  cifras de ancho fijo alineadas a la derecha, para comparar dos
                  publicaciones linea a linea. Sangra hasta el borde de la
                  tarjeta para que la etiqueta quede alineada con el titulo. */}
              <table className="-mx-[var(--pad-panel)] w-[calc(100%+var(--pad-panel)*2)] border-collapse text-[14px]">
                <tbody>
                  {filas.map((fila) => (
                    <tr key={fila.etiqueta} className="border-b border-[var(--color-border)] last:border-0 odd:bg-[var(--color-background)]">
                      <th scope="row" className="w-[44%] px-[var(--pad-panel)] py-[var(--pad-cell)] text-left font-normal text-[var(--color-text-muted)]">
                        {fila.etiqueta}
                      </th>
                      <td className="px-[var(--pad-panel)] py-[var(--pad-cell)] text-right font-semibold tabular-nums text-[var(--color-navy)]">
                        {fila.valor}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          ) : null}

          {documents.length ? (
            <Panel titulo="Documentos">
              <ul className="space-y-1">
                {documents.map((doc) => (
                  <li key={doc.url}>
                    <span className="flex min-h-[44px] items-center gap-3 rounded-[var(--radius-input)] border border-[var(--color-border)] px-[var(--pad-card)] text-[14px] font-medium text-[var(--color-navy)]">
                      <FileText className="size-4 shrink-0 text-[var(--color-primary)]" aria-hidden />
                      {doc.name}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          {pub.company ? (
            <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-[var(--pad-panel)]">
              <span className="movia-etiqueta">Vendedor</span>
              <Link
                href={`/empresa/${pub.company.id}`}
                className="mt-1 flex min-h-[44px] items-center text-[20px] font-semibold tracking-[var(--tracking-tight)] text-[var(--color-navy)] hover:text-[var(--color-primary)]"
                data-testid="seller-name"
              >
                {pub.company.name}
              </Link>

              <div className="mt-3 flex flex-wrap gap-2">
                <VerifiedBadge status={pub.company.verificationStatus} />
                <CompanyBadges badges={parseJson<string[]>(pub.company.badges, [])} />
              </div>

              <dl className="mt-4 border-t border-[var(--color-border)] pt-4 text-[13px]">
                <Fila etiqueta="Publicaciones activas" valor={String(pub.company._count.publications)} />
                <Fila etiqueta="Seguidores" valor={String(pub.company._count.followers)} />
                <Fila etiqueta="En MOVIA desde" valor={shortDate(pub.company.createdAt)} />
                {pub.company.responseTimeMins ? (
                  <Fila
                    etiqueta="Tiempo de respuesta"
                    valor={
                      pub.company.responseTimeMins < 60
                        ? `${pub.company.responseTimeMins} min`
                        : `${Math.round(pub.company.responseTimeMins / 60)} h`
                    }
                  />
                ) : null}
              </dl>

              {pub.company.verificationStatus === 'approved' ? (
                <p className="mt-4 flex items-start gap-2 rounded-[var(--radius-input)] bg-[var(--color-primary-soft)] p-[var(--pad-cell)] text-[12px] leading-relaxed text-[#1E40AF]">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
                  <span>Identidad empresarial validada con NIT y Camara de Comercio.</span>
                </p>
              ) : null}
            </section>
          ) : null}

          <ContactPanel
            publicationId={pub.id}
            publicationTitle={pub.title}
            publicationSlug={pub.slug}
            sellerPhone={pub.company?.phone ?? null}
            sellerEmail={pub.company?.email ?? null}
          />
        </aside>
      </div>

      {similar.length ? (
        <section>
          <div className="mb-6">
            <h2 className="text-[24px] font-semibold leading-tight tracking-[var(--tracking-tight)] text-[var(--color-navy)] md:text-[28px]">
              Activos similares
            </h2>
            <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">
              Mas {pub.category.name.toLowerCase()} en el catalogo
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="similar-grid">
            {similar.map((item, i) => (
              <PublicationCard key={item.id} item={item} index={i} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function Panel({
  titulo,
  testId,
  children,
}: {
  titulo: string
  testId?: string
  children: React.ReactNode
}) {
  return (
    <section
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-[var(--pad-panel)]"
      data-testid={testId}
    >
      <h2 className="mb-4 text-[20px] font-semibold tracking-[var(--tracking-tight)] text-[var(--color-navy)]">
        {titulo}
      </h2>
      {children}
    </section>
  )
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="min-w-0">
      <dt className="movia-etiqueta">{etiqueta}</dt>
      <dd className="mt-1.5 text-[14px] font-semibold tabular-nums text-[var(--color-navy)]">{valor}</dd>
    </div>
  )
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex min-h-7 items-baseline justify-between gap-3">
      <dt className="text-[var(--color-text-muted)]">{etiqueta}</dt>
      <dd className="font-semibold tabular-nums text-[var(--color-navy)]">{valor}</dd>
    </div>
  )
}
