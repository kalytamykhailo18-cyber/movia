import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { PlanEditor } from '@/components/admin/plan-editor'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Planes y tarifas' }

export default async function AdminPlansPage() {
  const plans = await db.plan.findMany({
    orderBy: { position: 'asc' },
    select: {
      id: true,
      slug: true,
      name: true,
      kind: true,
      price: true,
      currency: true,
      durationDays: true,
      publicationQuota: true,
      featuredQuota: true,
      active: true,
    },
  })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[28px] font-bold text-[var(--color-navy)]">Planes y tarifas</h1>
        <p className="mt-1 text-[16px] text-[var(--color-text-muted)]">
          Precios, vigencias y cupos se editan aqui y aplican de inmediato en la pagina publica.
        </p>
      </header>

      <PlanEditor plans={plans} />
    </div>
  )
}
