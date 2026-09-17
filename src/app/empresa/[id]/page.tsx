import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MapPin, Users, FileText, Clock, Star } from 'lucide-react'
import { db } from '@/lib/db'
import { env } from '@/lib/env'
import { parseJson } from '@/lib/utils'
import { shortDate } from '@/lib/format'
import { toCard } from '@/server/publications'
import { PublicationCard } from '@/components/publication-card'
import { AnimatedSection } from '@/components/animated-section'
import { VerifiedBadge, CompanyBadges } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { resolvePage, pageMeta } from '@/lib/paginate'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const CARD_SELECT = {
  id: true,
  slug: true,
  title: true,
  price: true,
  currency: true,
  condition: true,
  photos: true,
  featured: true,
  publishedAt: true,
  viewCount: true,
  leadCount: true,
  city: { select: { name: true } },
  company: { select: { name: true, verificationStatus: true } },
} as const

async function getCompany(id: string) {
  return db.company.findUnique({
    where: { id },
    include: {
      city: true,
      _count: { select: { followers: true, publications: true } },
      reviewsReceived: {
        where: { status: 'approved' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          author: { select: { fullName: true } },
        },
      },
    },
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const company = await getCompany(id)
  if (!company) return { title: 'Empresa no encontrada' }

  return {
    title: company.name,
    description: company.description ?? undefined,
    alternates: { canonical: `${env.app.url}/empresa/${company.id}` },
  }
}

export default async function CompanyPage({ params, searchParams }: Props) {
  const { id } = await params
  const query = await searchParams
  const company = await getCompany(id)
  if (!company) notFound()

  const pagina = resolvePage(query.page, env.search.companyPageSize)
  const totalPublicaciones = await db.publication.count({
    where: { companyId: company.id, status: 'active' },
  })
  const meta = pageMeta(totalPublicaciones, pagina)

  const publications = await db.publication.findMany({
    where: { companyId: company.id, status: 'active' },
    select: CARD_SELECT,
    orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
    skip: pagina.skip,
    take: pagina.take,
  })

  const ratings = company.reviewsReceived.map((r) => r.rating)
  const average = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.name,
    legalName: company.legalName,
    description: company.description,
    address: company.city ? { '@type': 'PostalAddress', addressLocality: company.city.name } : undefined,
  }

  return (
    <div className="space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header
        className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-6"
        data-testid="company-header"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[28px] font-bold text-[var(--color-navy)] md:text-[32px]">
              {company.name}
            </h1>
            <p className="mt-1 text-[14px] text-[var(--color-text-muted)]">{company.legalName}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <VerifiedBadge status={company.verificationStatus} />
              <CompanyBadges badges={parseJson<string[]>(company.badges, [])} />
            </div>
          </div>

          {average !== null ? (
            <div className="text-right" data-testid="company-rating">
              <p className="inline-flex items-center gap-1 text-[24px] font-bold text-[var(--color-navy)]">
                <Star className="size-5 text-[var(--color-primary)]" aria-hidden />
                {average.toFixed(1)}
              </p>
              <p className="text-[12px] text-[var(--color-text-muted)]">
                {ratings.length} {ratings.length === 1 ? 'resena' : 'resenas'}
              </p>
            </div>
          ) : null}
        </div>

        {company.description ? (
          <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-[var(--color-navy)]">
            {company.description}
          </p>
        ) : null}

        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-[var(--color-border)] pt-5 sm:grid-cols-4">
          <Fact
            icon={<FileText className="size-3.5" />}
            label="Publicaciones activas"
            value={String(totalPublicaciones)}
          />
          <Fact
            icon={<Users className="size-3.5" />}
            label="Seguidores"
            value={String(company._count.followers)}
          />
          <Fact
            icon={<MapPin className="size-3.5" />}
            label="Ubicacion"
            value={company.city?.name ?? '-'}
          />
          <Fact
            icon={<Clock className="size-3.5" />}
            label="En MOVIA desde"
            value={shortDate(company.createdAt)}
          />
        </dl>
      </header>

      <AnimatedSection>
        <h2 className="mb-4 text-[24px] font-semibold text-[var(--color-navy)]">
          Activos publicados
        </h2>
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          pageSize={meta.pageSize}
          label="publicaciones"
          compact
          testId="pagination-top"
        />

        {publications.length ? (
          <div
            className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
            data-testid="company-publications"
          >
            {publications.map((item, i) => (
              <PublicationCard key={item.id} item={toCard(item)} index={i} />
            ))}
          </div>
        ) : (
          <p
            className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] bg-white p-8 text-center text-[14px] text-[var(--color-text-muted)]"
            data-testid="company-publications-empty"
          >
            Esta empresa no tiene publicaciones activas en este momento.
          </p>
        )}

        <div className="mt-4">
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            pageSize={meta.pageSize}
            label="publicaciones"
          />
        </div>
      </AnimatedSection>

      {company.reviewsReceived.length ? (
        <AnimatedSection>
          <h2 className="mb-4 text-[24px] font-semibold text-[var(--color-navy)]">Resenas</h2>
          <ul className="space-y-3" data-testid="company-reviews">
            {company.reviewsReceived.map((review) => (
              <li
                key={review.id}
                className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[14px] font-medium text-[var(--color-navy)]">
                    {review.author.fullName}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[13px] text-[var(--color-navy)]">
                    <Star className="size-3.5 text-[var(--color-primary)]" aria-hidden />
                    {review.rating}
                  </span>
                </div>
                {review.comment ? (
                  <p className="mt-2 text-[14px] text-[var(--color-text-muted)]">{review.comment}</p>
                ) : null}
                <p className="mt-2 text-[12px] text-[var(--color-text-muted)]">
                  {shortDate(review.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </AnimatedSection>
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
