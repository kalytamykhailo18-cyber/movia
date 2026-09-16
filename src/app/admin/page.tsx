import type { Metadata } from 'next'
import Link from 'next/link'
import { Tag, BadgeCheck, Users, FileText, Wallet } from 'lucide-react'
import { db } from '@/lib/db'
import { money, shortDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Administracion' }

export default async function AdminHomePage() {
  const [users, companies, pending, publications, activePublications, payments, subscriptions, audit] =
    await Promise.all([
      db.user.count(),
      db.company.count(),
      db.company.count({ where: { verificationStatus: { in: ['pending', 'review'] } } }),
      db.publication.count(),
      db.publication.count({ where: { status: 'active' } }),
      db.payment.aggregate({ _sum: { amountTotal: true }, where: { status: 'approved' } }),
      db.subscription.count({ where: { status: 'active' } }),
      db.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
    ])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[28px] font-bold text-[var(--color-navy)]">Administracion</h1>
        <p className="mt-1 text-[16px] text-[var(--color-text-muted)]">
          Estado general de la plataforma.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="admin-metrics">
        <Metric label="Ingresos aprobados" value={money(payments._sum.amountTotal ?? 0)} icon={<Wallet className="size-5" />} testId="metric-revenue" />
        <Metric label="Suscripciones activas" value={String(subscriptions)} icon={<Tag className="size-5" />} testId="metric-subs" />
        <Metric label="Publicaciones activas" value={`${activePublications} / ${publications}`} icon={<FileText className="size-5" />} testId="metric-pubs" />
        <Metric label="Usuarios" value={String(users)} icon={<Users className="size-5" />} testId="metric-users" />
      </div>

      <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-semibold text-[var(--color-navy)]">Verificaciones pendientes</h2>
            <p className="mt-1 text-[14px] text-[var(--color-text-muted)]">
              <span data-testid="pending-count">{pending}</span> de {companies} empresas esperan revision.
            </p>
          </div>
          <Link
            href="/admin/verificaciones"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-input)] bg-[var(--color-primary)] px-4 text-[14px] font-semibold text-white"
          >
            <BadgeCheck className="size-4" aria-hidden />
            Revisar
          </Link>
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5">
        <h2 className="text-[18px] font-semibold text-[var(--color-navy)]">Actividad reciente</h2>
        <ul className="mt-3 divide-y divide-[var(--color-border)]" data-testid="audit-log">
          {audit.length ? (
            audit.map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5 text-[13px]">
                <span className="font-medium text-[var(--color-navy)]">{entry.action}</span>
                <span className="text-[var(--color-text-muted)]">
                  {entry.actorEmail ?? 'sistema'} · {shortDate(entry.createdAt)}
                </span>
              </li>
            ))
          ) : (
            <li className="py-2.5 text-[13px] text-[var(--color-text-muted)]">Sin actividad registrada.</li>
          )}
        </ul>
      </section>
    </div>
  )
}

function Metric({ label, value, icon, testId }: { label: string; value: string; icon: React.ReactNode; testId: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4" data-testid={testId}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] text-[var(--color-text-muted)]">{label}</span>
        <span className="text-[var(--color-primary)]">{icon}</span>
      </div>
      <p className="mt-2 text-[22px] font-bold text-[var(--color-navy)]">{value}</p>
    </div>
  )
}
