import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Eye, MessageSquare, Heart, Clock, ExternalLink } from 'lucide-react'
import { getPublicationPerformance, getViewerCompany } from '@/server/analytics'
import { CompletenessBar } from '@/components/ui/completeness-bar'
import { AnimatedSection } from '@/components/animated-section'
import { Badge } from '@/components/ui/badge'
import { money, shortDate } from '@/lib/format'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Mis publicaciones' }

const STATUS_TONE: Record<string, 'success' | 'neutral' | 'danger' | 'featured'> = {
  active: 'success',
  sold: 'featured',
  expired: 'danger',
  withdrawn: 'neutral',
}

const STATUS_LABEL: Record<string, string> = {
  active: 'Activa',
  sold: 'Vendida',
  expired: 'Vencida',
  withdrawn: 'Retirada',
}

export default async function PublicationsPage() {
  const company = await getViewerCompany()
  if (!company) redirect('/ingresar')

  const rows = await getPublicationPerformance(company.id)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[28px] font-bold text-[var(--color-navy)]">Mis publicaciones</h1>
        <p className="mt-1 text-[16px] text-[var(--color-text-muted)]">
          Que resultado genero cada publicacion: quien la vio, la guardo y te contacto.
        </p>
      </header>

      <AnimatedSection>
        <div className="space-y-3" data-testid="performance-list">
          {rows.map((row) => (
            <article
              key={row.id}
              className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4"
              data-testid="performance-row"
            >
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex gap-3 sm:w-[340px] sm:shrink-0">
                  {row.photo ? (
                    <img
                      src={row.photo}
                      alt=""
                      className="size-20 shrink-0 rounded-[var(--radius-input)] object-cover"
                    />
                  ) : (
                    <div className="size-20 shrink-0 rounded-[var(--radius-input)] bg-[var(--color-background)]" />
                  )}

                  <div className="min-w-0">
                    <Link
                      href={`/publicacion/${row.slug}`}
                      className="inline-flex items-start gap-1 text-[15px] font-semibold leading-snug text-[var(--color-navy)] hover:text-[var(--color-primary)]"
                      data-testid="performance-title"
                    >
                      <span className="line-clamp-2">{row.title}</span>
                      <ExternalLink className="mt-0.5 size-4 shrink-0" aria-hidden />
                    </Link>

                    <p className="mt-1 text-[14px] font-medium text-[var(--color-navy)]">
                      {money(row.price, row.currency)}
                    </p>

                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <Badge tone={STATUS_TONE[row.status] ?? 'neutral'}>
                        {STATUS_LABEL[row.status] ?? row.status}
                      </Badge>
                      {row.status === 'active' && row.daysToExpiry <= 3 ? (
                        <Badge tone="danger">Vence en {row.daysToExpiry} dias</Badge>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Metric icon={<Eye className="size-4" />} label="Vistas" value={row.views} testId="metric-views" />
                    <Metric
                      icon={<MessageSquare className="size-4" />}
                      label="Contactos"
                      value={row.leads}
                      testId="metric-leads"
                    />
                    <Metric
                      icon={<Heart className="size-4" />}
                      label="Favoritos"
                      value={row.favorites}
                      testId="metric-favorites"
                    />
                    <Metric
                      icon={<Clock className="size-4" />}
                      label="Dias activa"
                      value={row.daysActive}
                      testId="metric-days"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[var(--color-text-muted)]">
                    <span data-testid="metric-conversion">Conversion {row.conversionRate}%</span>
                    <span>WhatsApp {row.whatsappClicks}</span>
                    <span>Correo {row.emailClicks}</span>
                    <span>Chats {row.chatsStarted}</span>
                    <span data-testid="metric-first-contact">
                      {row.hoursToFirstContact !== null
                        ? `Primer contacto a las ${row.hoursToFirstContact} h`
                        : 'Sin contactos aun'}
                    </span>
                    <span>Publicada {shortDate(row.publishedAt)}</span>
                  </div>

                  <CompletenessBar score={row.completeness} compact />
                </div>
              </div>
            </article>
          ))}
        </div>
      </AnimatedSection>
    </div>
  )
}

function Metric({
  icon,
  label,
  value,
  testId,
}: {
  icon: React.ReactNode
  label: string
  value: number
  testId: string
}) {
  return (
    <div className="rounded-[var(--radius-input)] bg-[var(--color-background)] p-2.5">
      <span className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
        <span className="text-[var(--color-primary)]">{icon}</span>
        {label}
      </span>
      <p className="mt-0.5 text-[18px] font-bold tabular-nums text-[var(--color-navy)]" data-testid={testId}>
        {value}
      </p>
    </div>
  )
}
