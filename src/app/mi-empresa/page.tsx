import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Eye, MessageSquare, Heart, Mail, Users, FileText, TrendingUp } from 'lucide-react'
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon'
import { getCompanySummary, getDefaultCompany } from '@/server/analytics'
import { StatCard } from '@/components/dashboard/stat-card'
import { TrendChart } from '@/components/dashboard/trend-chart'
import { AnimatedSection } from '@/components/animated-section'
import { VerifiedBadge, CompanyBadges } from '@/components/ui/badge'
import { shortDate, relativeDays } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Mi Empresa' }

const SOURCE_LABEL: Record<string, string> = {
  whatsapp: 'WhatsApp',
  chat: 'Chat interno',
  email: 'Correo',
}

export default async function DashboardPage() {
  const company = await getDefaultCompany()
  if (!company) notFound()

  const summary = await getCompanySummary(company.id)
  if (!summary) notFound()

  const daysToRenewal = summary.subscription ? relativeDays(summary.subscription.expiresAt) : null

  return (
    <div className="space-y-6">
      <header className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-[var(--color-navy)]" data-testid="company-name">
              {summary.company.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <VerifiedBadge status={summary.company.verificationStatus} />
              <CompanyBadges badges={summary.company.badges} />
            </div>
            <p className="mt-2 text-[13px] text-[var(--color-text-muted)]">
              En MOVIA desde {shortDate(summary.company.createdAt)}
              {summary.company.responseTimeMins
                ? ` · Responde en ${
                    summary.company.responseTimeMins < 60
                      ? `${summary.company.responseTimeMins} min`
                      : `${Math.round(summary.company.responseTimeMins / 60)} h`
                  }`
                : ''}
            </p>
          </div>

          {summary.subscription ? (
            <div
              className="rounded-[var(--radius-card)] bg-[var(--color-primary-soft)] p-4 text-[13px]"
              data-testid="subscription-card"
            >
              <p className="font-semibold text-[var(--color-primary)]">{summary.subscription.planName}</p>
              <p className="mt-1 text-[var(--color-navy)]">
                {summary.subscription.quotaUsed} de {summary.subscription.quotaTotal} publicaciones usadas
              </p>
              <p className="mt-1 text-[var(--color-text-muted)]">
                Renueva en {daysToRenewal} dias ({shortDate(summary.subscription.expiresAt)})
              </p>
              <Link
                href="/mi-empresa/facturacion"
                className="mt-2 inline-block font-medium text-[var(--color-primary)] hover:underline"
              >
                Ver facturacion
              </Link>
            </div>
          ) : null}
        </div>
      </header>

      <AnimatedSection>
        <h2 className="mb-3 text-[20px] font-semibold text-[var(--color-navy)]">
          Resultados de tus publicaciones
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="kpi-grid">
          <StatCard
            label="Visualizaciones"
            value={summary.totals.views}
            icon={<Eye className="size-5" />}
            tone="primary"
            hint="Total historico"
            testId="kpi-views"
          />
          <StatCard
            label="Contactos recibidos"
            value={summary.totals.leads}
            icon={<MessageSquare className="size-5" />}
            tone="accent"
            hint="Leads de todos los canales"
            testId="kpi-leads"
          />
          <StatCard
            label="Favoritos"
            value={summary.totals.favorites}
            icon={<Heart className="size-5" />}
            hint="Compradores interesados"
            testId="kpi-favorites"
          />
          <StatCard
            label="Seguidores"
            value={summary.totals.followers}
            icon={<Users className="size-5" />}
            hint="Reciben tus nuevas publicaciones"
            testId="kpi-followers"
          />
        </div>
      </AnimatedSection>

      <AnimatedSection>
        <h2 className="mb-3 text-[20px] font-semibold text-[var(--color-navy)]">Canales de contacto</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="channel-grid">
          <StatCard
            label="Clics en WhatsApp"
            value={summary.totals.whatsappClicks}
            icon={<WhatsAppIcon className="size-5" />}
            tone="success"
            testId="kpi-whatsapp"
          />
          <StatCard
            label="Contactos por correo"
            value={summary.totals.emailClicks}
            icon={<Mail className="size-5" />}
            testId="kpi-email"
          />
          <StatCard
            label="Chats iniciados"
            value={summary.totals.chatsStarted}
            icon={<MessageSquare className="size-5" />}
            testId="kpi-chats"
          />
          <StatCard
            label="Publicaciones activas"
            value={summary.publications.active}
            icon={<FileText className="size-5" />}
            tone="primary"
            hint={`${summary.publications.total} en total`}
            testId="kpi-active"
          />
        </div>
      </AnimatedSection>

      <AnimatedSection>
        <TrendChart data={summary.trend} />
      </AnimatedSection>

      <AnimatedSection>
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5">
            <h2 className="text-[18px] font-semibold text-[var(--color-navy)]">Contactos por canal</h2>
            <ul className="mt-4 space-y-3" data-testid="source-breakdown">
              {summary.leadsBySource.length ? (
                summary.leadsBySource.map((row) => {
                  const total = summary.leadsBySource.reduce((s, r) => s + r.count, 0)
                  const pct = Math.round((row.count / total) * 100)
                  return (
                    <li key={row.source}>
                      <div className="flex items-baseline justify-between text-[14px]">
                        <span className="text-[var(--color-navy)]">
                          {SOURCE_LABEL[row.source] ?? row.source}
                        </span>
                        <span className="text-[var(--color-text-muted)]">
                          {row.count} ({pct}%)
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--color-border)]">
                        <div
                          className="h-full rounded-full bg-[var(--color-primary)]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  )
                })
              ) : (
                <li className="text-[14px] text-[var(--color-text-muted)]">
                  Aun no recibes contactos en este periodo.
                </li>
              )}
            </ul>
          </section>

          <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5">
            <h2 className="text-[18px] font-semibold text-[var(--color-navy)]">Estado del inventario</h2>
            <dl className="mt-4 space-y-3 text-[14px]" data-testid="inventory-breakdown">
              <InventoryRow label="Activas" value={summary.publications.active} tone="success" />
              <InventoryRow label="Vendidas" value={summary.publications.sold} tone="primary" />
              <InventoryRow label="Vencidas" value={summary.publications.expired} tone="muted" />
              <InventoryRow label="Retiradas" value={summary.publications.withdrawn} tone="muted" />
            </dl>

            <Link
              href="/mi-empresa/publicaciones"
              className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--color-primary)] hover:underline"
            >
              <TrendingUp className="size-4" aria-hidden />
              Ver rendimiento por publicacion
            </Link>
          </section>
        </div>
      </AnimatedSection>
    </div>
  )
}

function InventoryRow({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'success' | 'primary' | 'muted'
}) {
  const color = {
    success: 'text-[var(--color-success)]',
    primary: 'text-[var(--color-primary)]',
    muted: 'text-[var(--color-text-muted)]',
  }[tone]

  return (
    <div className="flex items-baseline justify-between border-b border-[var(--color-border)] pb-2 last:border-0">
      <dt className="text-[var(--color-navy)]">{label}</dt>
      <dd className={`text-[18px] font-semibold tabular-nums ${color}`}>{value}</dd>
    </div>
  )
}
