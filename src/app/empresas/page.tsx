import type { Metadata } from 'next'
import Link from 'next/link'
import { BadgeCheck, MapPin } from 'lucide-react'
import { db } from '@/lib/db'
import { parseJson } from '@/lib/utils'
import { shortDate } from '@/lib/format'
import { AnimatedSection } from '@/components/animated-section'
import { VerifiedBadge, CompanyBadges } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'
import { resolvePage, pageMeta } from '@/lib/paginate'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Empresas verificadas' }

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function CompaniesPage({ searchParams }: Props) {
  const query = await searchParams
  const pagina = resolvePage(query.page, env.search.companyPageSize)

  const total = await db.company.count()
  const meta = pageMeta(total, pagina)

  const companies = await db.company.findMany({
    skip: pagina.skip,
    take: pagina.take,
    orderBy: [{ verificationStatus: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      name: true,
      description: true,
      badges: true,
      verificationStatus: true,
      createdAt: true,
      city: { select: { name: true } },
      _count: { select: { publications: { where: { status: 'active' } }, followers: true } },
    },
  })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[32px] font-bold text-[var(--color-navy)]">Empresas</h1>
        <p className="mt-2 text-[16px] text-[var(--color-text-muted)]">
          Empresas con identidad validada por NIT y Camara de Comercio.
        </p>
      </header>

      <Pagination
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        pageSize={meta.pageSize}
        label="empresas"
        testId="pagination-top"
      />

      <AnimatedSection>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="companies-list">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/empresa/${company.id}`}
              data-testid="company-card"
              className="flex flex-col rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-[18px] font-semibold text-[var(--color-navy)]">{company.name}</h2>
                {company.verificationStatus === 'approved' ? (
                  <BadgeCheck className="size-5 shrink-0 text-[var(--color-primary)]" aria-hidden />
                ) : null}
              </div>

              <div className="mt-2">
                <VerifiedBadge status={company.verificationStatus} />
              </div>

              {company.city ? (
                <p className="mt-2 inline-flex items-center gap-1 text-[12px] text-[var(--color-text-muted)]">
                  <MapPin className="size-3.5" aria-hidden />
                  {company.city.name}
                </p>
              ) : null}

              <p className="mt-2 line-clamp-3 flex-1 text-[14px] text-[var(--color-text-muted)]">
                {company.description}
              </p>

              <div className="mt-3">
                <CompanyBadges badges={parseJson<string[]>(company.badges, [])} />
              </div>

              <dl className="mt-3 flex items-center gap-4 border-t border-[var(--color-border)] pt-3 text-[12px]">
                <div>
                  <dt className="text-[var(--color-text-muted)]">Activos</dt>
                  <dd className="font-semibold text-[var(--color-navy)]">{company._count.publications}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-muted)]">Seguidores</dt>
                  <dd className="font-semibold text-[var(--color-navy)]">{company._count.followers}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-muted)]">Desde</dt>
                  <dd className="font-semibold text-[var(--color-navy)]">{shortDate(company.createdAt)}</dd>
                </div>
              </dl>
            </Link>
          ))}
        </div>
      </AnimatedSection>

      <Pagination
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        pageSize={meta.pageSize}
        label="empresas"
      />
    </div>
  )
}
