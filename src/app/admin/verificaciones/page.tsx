import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { VerificationQueue } from '@/components/admin/decision-list'
import { PageIntro } from '@/components/page-intro'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Verificaciones' }

export default async function AdminVerificationsPage() {
  const companies = await db.company.findMany({
    where: { verificationStatus: { in: ['pending', 'review'] } },
    orderBy: { createdAt: 'asc' },
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
    </div>
  )
}
