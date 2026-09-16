import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Download, CreditCard, Landmark } from 'lucide-react'
import { getCompanyBilling, getDefaultCompany } from '@/server/analytics'
import { AnimatedSection } from '@/components/animated-section'
import { Badge } from '@/components/ui/badge'
import { money, shortDate, relativeDays } from '@/lib/format'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Suscripcion y facturacion' }

const STATUS_TONE: Record<string, 'success' | 'pending' | 'danger'> = {
  approved: 'success',
  pending: 'pending',
  declined: 'danger',
}

export default async function BillingPage() {
  const company = await getDefaultCompany()
  if (!company) notFound()

  const { payments, subscription, taxLabel } = await getCompanyBilling(company.id)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[28px] font-bold text-[var(--color-navy)]">Suscripcion y facturacion</h1>
        <p className="mt-1 text-[16px] text-[var(--color-text-muted)]">
          Tu plan activo, consumo de cupos e historial de pagos con factura electronica.
        </p>
      </header>

      {subscription ? (
        <AnimatedSection>
          <section
            className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5"
            data-testid="plan-card"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-[20px] font-semibold text-[var(--color-navy)]">
                  {subscription.plan.name}
                </h2>
                <p className="mt-1 text-[14px] text-[var(--color-text-muted)]">
                  {money(subscription.plan.price)} al mes · {taxLabel} incluido
                </p>
                <div className="mt-2">
                  <Badge tone="success">Suscripcion activa</Badge>
                  {subscription.autoRenew ? <Badge tone="neutral">Renovacion automatica</Badge> : null}
                </div>
              </div>

              <div className="text-right text-[13px]">
                <p className="text-[var(--color-text-muted)]">Renueva</p>
                <p className="text-[16px] font-semibold text-[var(--color-navy)]">
                  {shortDate(subscription.expiresAt)}
                </p>
                <p className="text-[var(--color-text-muted)]">
                  en {relativeDays(subscription.expiresAt)} dias
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 border-t border-[var(--color-border)] pt-4">
              <QuotaBar
                label="Publicaciones del plan"
                used={subscription.quotaUsed}
                total={subscription.plan.publicationQuota}
                testId="quota-publications"
              />
              <QuotaBar
                label="Destacados incluidos"
                used={0}
                total={subscription.plan.featuredQuota}
                testId="quota-featured"
              />
            </div>
          </section>
        </AnimatedSection>
      ) : null}

      <AnimatedSection>
        <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white">
          <div className="border-b border-[var(--color-border)] p-5">
            <h2 className="text-[18px] font-semibold text-[var(--color-navy)]">Historial de pagos</h2>
            <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
              El precio mostrado incluye {taxLabel} de {Math.round(env.tax.rate * 100)}%.
            </p>
          </div>

          {payments.length ? (
            <div className="movia-scrollbar overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-[13px]" data-testid="payments-table">
                <thead className="bg-[var(--color-background)] text-[12px] text-[var(--color-text-muted)]">
                  <tr>
                    <th className="px-5 py-2.5 font-medium">Concepto</th>
                    <th className="px-5 py-2.5 font-medium">Fecha</th>
                    <th className="px-5 py-2.5 font-medium">Medio</th>
                    <th className="px-5 py-2.5 text-right font-medium">Base</th>
                    <th className="px-5 py-2.5 text-right font-medium">{taxLabel}</th>
                    <th className="px-5 py-2.5 text-right font-medium">Total</th>
                    <th className="px-5 py-2.5 font-medium">Factura</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-t border-[var(--color-border)]"
                      data-testid="payment-row"
                    >
                      <td className="px-5 py-3">
                        <span className="font-medium text-[var(--color-navy)]">{payment.concept}</span>
                        <span className="mt-1 block">
                          <Badge tone={STATUS_TONE[payment.status] ?? 'neutral'}>{payment.status}</Badge>
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[var(--color-text-muted)]">
                        {shortDate(payment.paidAt ?? payment.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 text-[var(--color-navy)]">
                          {payment.method === 'pse' ? (
                            <Landmark className="size-4" aria-hidden />
                          ) : (
                            <CreditCard className="size-4" aria-hidden />
                          )}
                          {payment.method === 'pse' ? 'PSE' : 'Tarjeta'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        {money(payment.amountNet, payment.currency)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-[var(--color-text-muted)]">
                        {money(payment.taxAmount, payment.currency)}
                      </td>
                      <td
                        className="px-5 py-3 text-right font-semibold tabular-nums text-[var(--color-navy)]"
                        data-testid="payment-total"
                      >
                        {money(payment.amountTotal, payment.currency)}
                      </td>
                      <td className="px-5 py-3">
                        {payment.invoiceNumber ? (
                          <span
                            className="inline-flex items-center gap-1.5 text-[var(--color-primary)]"
                            data-testid="invoice-number"
                          >
                            <Download className="size-4" aria-hidden />
                            {payment.invoiceNumber}
                          </span>
                        ) : (
                          <span className="text-[var(--color-text-muted)]">Pendiente</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="p-8 text-center text-[14px] text-[var(--color-text-muted)]" data-testid="payments-empty">
              Aun no tienes pagos registrados.
            </p>
          )}
        </section>
      </AnimatedSection>
    </div>
  )
}

function QuotaBar({
  label,
  used,
  total,
  testId,
}: {
  label: string
  used: number
  total: number
  testId: string
}) {
  const pct = total ? Math.min(100, Math.round((used / total) * 100)) : 0

  return (
    <div data-testid={testId}>
      <div className="flex items-baseline justify-between text-[13px]">
        <span className="text-[var(--color-navy)]">{label}</span>
        <span className="text-[var(--color-text-muted)]">
          {used} de {total}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--color-border)]">
        <div
          className="h-full rounded-full bg-[var(--color-primary)]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
