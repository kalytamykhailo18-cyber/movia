import type { Metadata } from 'next'
import { Check, Landmark, CreditCard, Receipt } from 'lucide-react'
import { db } from '@/lib/db'
import { env } from '@/lib/env'
import { parseJson } from '@/lib/utils'
import { money } from '@/lib/format'
import { breakdown } from '@/lib/tax'
import { AnimatedSection } from '@/components/animated-section'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Planes y precios' }

const KIND_LABEL: Record<string, string> = {
  single: 'Publicacion individual',
  subscription: 'Suscripcion mensual',
  featured: 'Visibilidad',
}

export default async function PlansPage() {
  const plans = await db.plan.findMany({
    where: { active: true },
    orderBy: { position: 'asc' },
  })

  const grouped = ['subscription', 'single', 'featured'].map((kind) => ({
    kind,
    label: KIND_LABEL[kind],
    items: plans.filter((p) => p.kind === kind),
  }))

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-[32px] font-bold text-[var(--color-navy)] md:text-[40px]">
          Planes y precios
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-[16px] text-[var(--color-text-muted)]">
          El valor que ves es el valor final, con {env.tax.label} incluido. Sin cargos sorpresa.
        </p>
      </header>

      {grouped.map((group) =>
        group.items.length ? (
          <AnimatedSection key={group.kind}>
            <h2 className="mb-4 text-[24px] font-semibold text-[var(--color-navy)]">{group.label}</h2>
            <div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
              data-testid={`plans-${group.kind}`}
            >
              {group.items.map((plan) => {
                const price = breakdown(plan.price)
                const features = parseJson<string[]>(plan.features, [])
                const highlighted = plan.slug === 'empresa-mensual'

                return (
                  <article
                    key={plan.id}
                    data-testid="plan-card"
                    className={`flex flex-col rounded-[var(--radius-card)] border bg-white p-5 ${
                      highlighted
                        ? 'border-[var(--color-primary)] shadow-[var(--shadow-card-hover)]'
                        : 'border-[var(--color-border)] shadow-[var(--shadow-card)]'
                    }`}
                  >
                    {highlighted ? (
                      <div className="mb-2">
                        <Badge tone="verified">Mas elegido</Badge>
                      </div>
                    ) : null}

                    <h3 className="text-[18px] font-semibold text-[var(--color-navy)]">{plan.name}</h3>

                    <p
                      className="mt-3 text-[28px] font-bold text-[var(--color-navy)]"
                      data-testid="plan-price"
                    >
                      {money(plan.price, plan.currency)}
                    </p>
                    <p className="text-[12px] text-[var(--color-text-muted)]" data-testid="plan-tax">
                      Base {money(price.net, plan.currency)} + {env.tax.label}{' '}
                      {money(price.tax, plan.currency)}
                    </p>

                    <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                      Vigencia {plan.durationDays} dias
                    </p>

                    <ul className="mt-4 flex-1 space-y-2">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-[14px]">
                          <Check
                            className="mt-0.5 size-4 shrink-0 text-[var(--color-success)]"
                            aria-hidden
                          />
                          <span className="text-[var(--color-navy)]">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                )
              })}
            </div>
          </AnimatedSection>
        ) : null,
      )}

      <AnimatedSection>
        <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-6">
          <h2 className="text-[20px] font-semibold text-[var(--color-navy)]">Medios de pago</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            <li className="flex items-start gap-2 text-[14px] text-[var(--color-navy)]">
              <Landmark className="mt-0.5 size-4 shrink-0 text-[var(--color-primary)]" aria-hidden />
              PSE desde tu banco
            </li>
            <li className="flex items-start gap-2 text-[14px] text-[var(--color-navy)]">
              <CreditCard className="mt-0.5 size-4 shrink-0 text-[var(--color-primary)]" aria-hidden />
              Tarjeta debito y credito
            </li>
            <li className="flex items-start gap-2 text-[14px] text-[var(--color-navy)]">
              <Receipt className="mt-0.5 size-4 shrink-0 text-[var(--color-primary)]" aria-hidden />
              Factura electronica por cada pago
            </li>
          </ul>
          <p className="mt-4 text-[13px] text-[var(--color-text-muted)]">
            Las suscripciones se renuevan automaticamente con tu consentimiento y puedes cancelarlas
            cuando quieras. La cancelacion aplica al final del periodo ya pagado.
          </p>
        </section>
      </AnimatedSection>
    </div>
  )
}
