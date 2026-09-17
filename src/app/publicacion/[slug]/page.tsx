import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Calendar, Gauge, Package, ShieldCheck, FileText } from 'lucide-react'
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

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ViewTracker publicationId={pub.id} />

      <nav className="flex flex-wrap items-center gap-1 text-[12px] text-[var(--color-text-muted)]">
        <Link href="/" className="hover:text-[var(--color-primary)]">
          Inicio
        </Link>
        <span>/</span>
        <Link href={`/buscar?category=${pub.category.slug}`} className="hover:text-[var(--color-primary)]">
          {pub.category.name}
        </Link>
        <span>/</span>
        <span className="text-[var(--color-navy)]">{pub.title}</span>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Gallery photos={photos} title={pub.title} />

          <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white">
            {/* El precio manda en esta pagina, asi que va sobre el navy de la
                marca en vez de perderse entre el resto del texto. */}
            <div className="relative overflow-hidden bg-[var(--color-navy)] p-5 md:p-6">
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

                <h1 className="mt-3 text-[24px] font-bold leading-tight tracking-tight text-white md:text-[32px]">
                  {pub.title}
                </h1>

                <p
                  className="mt-4 text-[32px] font-bold leading-none tracking-tight text-white"
                  data-testid="detail-price"
                >
                  {money(pub.price, pub.currency)}
                </p>
                <p className="mt-1.5 text-[12px] text-white/55">
                  {env.tax.includedInPrice ? `${env.tax.label} incluido` : `Mas ${env.tax.label}`}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
              <Fact icon={<MapPin className="size-3.5" />} label="Ubicacion" value={pub.city?.name ?? '-'} />
              <Fact icon={<Calendar className="size-3.5" />} label="Ano" value={pub.year?.toString() ?? '-'} />
              <Fact
                icon={<Gauge className="size-3.5" />}
                label="Horas de uso"
                value={pub.usageHours ? `${pub.usageHours.toLocaleString(env.locale.locale)} h` : '-'}
              />
              <Fact icon={<Package className="size-3.5" />} label="Condicion" value={pub.condition ?? '-'} />
            </dl>
          </section>

          {pub.description ? (
            <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5">
              <h2 className="relative pl-3.5 text-[20px] font-semibold text-[var(--color-navy)]">
                <span className="absolute left-0 top-1/2 h-[1.05em] w-1 -translate-y-1/2 rounded-full bg-[var(--color-primary)]" />
                Descripcion
              </h2>
              <p className="mt-3 whitespace-pre-line text-[16px] leading-relaxed text-[var(--color-navy)]">
                {pub.description}
              </p>
            </section>
          ) : null}

          {Object.keys(specs).length ? (
            <section
              className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5"
              data-testid="specs-section"
            >
              <h2 className="relative pl-3.5 text-[20px] font-semibold text-[var(--color-navy)]">
                <span className="absolute left-0 top-1/2 h-[1.05em] w-1 -translate-y-1/2 rounded-full bg-[var(--color-primary)]" />
                Ficha tecnica
              </h2>
              <dl className="mt-3 overflow-hidden rounded-[var(--radius-input)] border border-[var(--color-border)]">
                {Object.entries(specs).map(([key, value]) => {
                  const attr = attributes.find((a) => a.key === key)
                  return (
                    <div
                      key={key}
                      className="flex items-baseline justify-between gap-4 px-3 py-2.5 odd:bg-[var(--color-background)]"
                    >
                      <dt className="text-[14px] text-[var(--color-text-muted)]">{attr?.label ?? key}</dt>
                      <dd className="text-[14px] font-medium text-[var(--color-navy)]">
                        {String(value)}
                        {attr?.unit ? ` ${attr.unit}` : ''}
                      </dd>
                    </div>
                  )
                })}
                {pub.brand ? (
                  <div className="flex items-baseline justify-between gap-4 px-3 py-2.5 odd:bg-[var(--color-background)]">
                    <dt className="text-[14px] text-[var(--color-text-muted)]">Marca</dt>
                    <dd className="text-[14px] font-medium text-[var(--color-navy)]">{pub.brand}</dd>
                  </div>
                ) : null}
                {pub.model ? (
                  <div className="flex items-baseline justify-between gap-4 px-3 py-2.5 odd:bg-[var(--color-background)]">
                    <dt className="text-[14px] text-[var(--color-text-muted)]">Modelo</dt>
                    <dd className="text-[14px] font-medium text-[var(--color-navy)]">{pub.model}</dd>
                  </div>
                ) : null}
              </dl>
            </section>
          ) : null}

          {documents.length ? (
            <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5">
              <h2 className="relative pl-3.5 text-[20px] font-semibold text-[var(--color-navy)]">
                <span className="absolute left-0 top-1/2 h-[1.05em] w-1 -translate-y-1/2 rounded-full bg-[var(--color-primary)]" />
                Documentos
              </h2>
              <ul className="mt-3 space-y-2">
                {documents.map((doc) => (
                  <li key={doc.url}>
                    <span className="inline-flex items-center gap-2 text-[14px] text-[var(--color-navy)]">
                      <FileText className="size-4 text-[var(--color-primary)]" aria-hidden />
                      {doc.name}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {pub.company ? (
            <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5">
              <h2 className="text-[14px] font-medium text-[var(--color-text-muted)]">Vendedor</h2>
              <Link
                href={`/empresa/${pub.company.id}`}
                className="mt-1 block text-[18px] font-semibold text-[var(--color-navy)] hover:text-[var(--color-primary)]"
                data-testid="seller-name"
              >
                {pub.company.name}
              </Link>

              <div className="mt-2">
                <VerifiedBadge status={pub.company.verificationStatus} />
              </div>

              <div className="mt-3">
                <CompanyBadges badges={parseJson<string[]>(pub.company.badges, [])} />
              </div>

              <dl className="mt-4 space-y-1.5 border-t border-[var(--color-border)] pt-4 text-[13px]">
                <Row label="Publicaciones activas" value={String(pub.company._count.publications)} />
                <Row label="Seguidores" value={String(pub.company._count.followers)} />
                <Row label="En MOVIA desde" value={shortDate(pub.company.createdAt)} />
                {pub.company.responseTimeMins ? (
                  <Row
                    label="Tiempo de respuesta"
                    value={
                      pub.company.responseTimeMins < 60
                        ? `${pub.company.responseTimeMins} min`
                        : `${Math.round(pub.company.responseTimeMins / 60)} h`
                    }
                  />
                ) : null}
              </dl>

              {pub.company.verificationStatus === 'approved' ? (
                <p className="mt-4 flex items-start gap-2 rounded-[var(--radius-input)] bg-[var(--color-primary-soft)] p-3 text-[12px] text-[var(--color-primary)]">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
                  Identidad empresarial validada con NIT y Camara de Comercio.
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
          <h2 className="relative mb-5 pl-4 text-[24px] font-semibold tracking-tight text-[var(--color-navy)]">
            <span className="absolute left-0 top-1/2 h-[1.1em] w-1 -translate-y-1/2 rounded-full bg-[var(--color-primary)]" />
            Activos similares
          </h2>
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

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-muted)]">
        <span className="text-[var(--color-primary)]">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1 text-[14px] font-medium text-[var(--color-navy)]">{value}</dd>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[var(--color-text-muted)]">{label}</dt>
      <dd className="font-medium text-[var(--color-navy)]">{value}</dd>
    </div>
  )
}
