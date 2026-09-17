import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { VerificationQueue } from '@/components/admin/decision-list'
import { Pagination } from '@/components/ui/pagination'
import { resolvePage, pageMeta } from '@/lib/paginate'
import { env } from '@/lib/env'
import { PageIntro } from '@/components/page-intro'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Verificaciones' }

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function AdminVerificationsPage({ searchParams }: Props) {
  const query = await searchParams
  const pagina = resolvePage(query.page, env.search.listPageSize)

  const where = { verificationStatus: { in: ['pending', 'review'] } }
  const total = await db.company.count({ where })
  const meta = pageMeta(total, pagina)

  const companies = await db.company.findMany({
    where,
    orderBy: { createdAt: 'asc' },
    skip: pagina.skip,
    take: pagina.take,
    select: {
      id: true,
      name: true,
      legalName: true,
      nit: true,
      nitCheckDigit: true,
      verificationStatus: true,
      verificationNote: true,
      city: { select: { name: true } },
      owner: { select: { email: true } },
    },
  })

  return (
    <div className="space-y-6">
      <PageIntro>
        <h1 className="text-[28px] font-bold text-[var(--color-navy)]">Verificaciones</h1>
        <p className="mt-1 text-[16px] text-[var(--color-text-muted)]">
          Empresas cuyo NIT es valido pero necesitan revision manual antes del distintivo.
        </p>
      </PageIntro>

      <Pagination
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        pageSize={meta.pageSize}
        label="empresas por revisar"
        compact
        testId="pagination-top"
      />

      <VerificationQueue
        companies={companies.map((c) => ({
          id: c.id,
          name: c.name,
          legalName: c.legalName,
          nit: c.nit,
          nitCheckDigit: c.nitCheckDigit,
          verificationStatus: c.verificationStatus,
          verificationNote: c.verificationNote,
          cityName: c.city?.name ?? null,
          ownerEmail: c.owner.email,
        }))}
      />

      <Pagination
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        pageSize={meta.pageSize}
        label="empresas por revisar"
      />
    </div>
  )
}
