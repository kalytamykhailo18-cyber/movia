'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { money } from '@/lib/format'
import { breakdown } from '@/lib/tax'
import { toastVariants, motionEnabled } from '@/lib/motion'
import { env } from '@/lib/env'

export type AdminPlan = {
  id: string
  slug: string
  name: string
  kind: string
  price: number
  currency: string
  durationDays: number
  publicationQuota: number
  featuredQuota: number
  active: boolean
}

export function PlanEditor({ plans }: { plans: AdminPlan[] }) {
  const router = useRouter()
  const [rows, setRows] = useState(plans)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function update(id: string, patch: Partial<AdminPlan>) {
    setRows((current) => current.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  async function save(plan: AdminPlan) {
    setError(null)
    setSavingId(plan.id)

    try {
      const res = await fetch(`/api/admin/planes/${plan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: plan.name,
          price: Number(plan.price),
          durationDays: Number(plan.durationDays),
          publicationQuota: Number(plan.publicationQuota),
          featuredQuota: Number(plan.featuredQuota),
          active: plan.active,
        }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'No pudimos guardar el plan')
        return
      }

      setSavedId(plan.id)
      setTimeout(() => setSavedId(null), 2500)
      router.refresh()
    } catch {
      setError('No pudimos guardar el plan')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {error ? (
          <motion.p
            variants={motionEnabled ? toastVariants : undefined}
            initial="hidden"
            animate="show"
            exit="exit"
            className="flex items-center gap-2 rounded-[var(--radius-input)] bg-red-50 p-3 text-[14px] text-[var(--color-danger)]"
            data-testid="plan-error"
          >
            <AlertTriangle className="size-4 shrink-0" aria-hidden />
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>

      {rows.map((plan) => {
        const price = breakdown(Number(plan.price) || 0)

        return (
          <section
            key={plan.id}
            className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5"
            data-testid="plan-row"
            data-slug={plan.slug}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-[18px] font-semibold text-[var(--color-navy)]">{plan.name}</h2>
                <p className="text-[12px] text-[var(--color-text-muted)]">{plan.slug}</p>
              </div>

              <label className="inline-flex min-h-[44px] items-center gap-2 text-[13px] text-[var(--color-navy)]">
                <input
                  type="checkbox"
                  checked={plan.active}
                  onChange={(e) => update(plan.id, { active: e.target.checked })}
                  data-testid={`plan-active-${plan.slug}`}
                  className="size-4"
                />
                Visible al publico
              </label>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <NumberField
                label={`Precio (${plan.currency})`}
                value={plan.price}
                onChange={(v) => update(plan.id, { price: v })}
                testId={`plan-price-${plan.slug}`}
              />
              <NumberField
                label="Vigencia (dias)"
                value={plan.durationDays}
                onChange={(v) => update(plan.id, { durationDays: v })}
                testId={`plan-duration-${plan.slug}`}
              />
              <NumberField
                label="Cupo publicaciones"
                value={plan.publicationQuota}
                onChange={(v) => update(plan.id, { publicationQuota: v })}
                testId={`plan-quota-${plan.slug}`}
              />
              <NumberField
                label="Cupo destacados"
                value={plan.featuredQuota}
                onChange={(v) => update(plan.id, { featuredQuota: v })}
                testId={`plan-featured-${plan.slug}`}
              />

              <div className="rounded-[var(--radius-input)] bg-[var(--color-background)] p-3">
                <span className="text-[11px] text-[var(--color-text-muted)]">
                  Se muestra al usuario
                </span>
                <p
                  className="text-[16px] font-bold text-[var(--color-navy)]"
                  data-testid={`plan-preview-${plan.slug}`}
                >
                  {money(Number(plan.price) || 0, plan.currency)}
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  Base {money(price.net, plan.currency)} + {env.tax.label}{' '}
                  {money(price.tax, plan.currency)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Button
                size="sm"
                loading={savingId === plan.id}
                onClick={() => save(plan)}
                data-testid={`plan-save-${plan.slug}`}
              >
                Guardar
              </Button>

              <AnimatePresence>
                {savedId === plan.id ? (
                  <motion.span
                    variants={motionEnabled ? toastVariants : undefined}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    className="inline-flex items-center gap-1.5 text-[13px] text-[var(--color-success)]"
                    data-testid={`plan-saved-${plan.slug}`}
                  >
                    <Check className="size-4" aria-hidden />
                    Guardado. Ya aplica en la pagina publica.
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </div>
          </section>
        )
      })}
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
  testId,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  testId: string
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-[var(--color-navy)]">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        data-testid={testId}
        className="mt-1 h-11 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] px-3 text-[14px] transition-colors"
      />
    </label>
  )
}
