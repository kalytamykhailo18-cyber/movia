'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, BadgeCheck, Building2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { nitCheckDigit } from '@/lib/nit'
import { accordionVariants, toastVariants, tabIndicatorTransition, motionEnabled } from '@/lib/motion'

type City = { id: string; name: string }
type AccountType = 'natural' | 'company'

export function RegisterForm({ cities }: { cities: City[] }) {
  const router = useRouter()
  const [accountType, setAccountType] = useState<AccountType>('company')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    companyName: '',
    legalName: '',
    nit: '',
    checkDigit: '',
    cityId: '',
    chamberOfCommerce: '',
  })

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const suggestedDigit = (() => {
    const digits = form.nit.replace(/\D/g, '')
    if (digits.length < 8) return null
    try {
      return nitCheckDigit(digits)
    } catch {
      return null
    }
  })()

  const digitMismatch =
    suggestedDigit !== null && form.checkDigit !== '' && form.checkDigit !== suggestedDigit

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSending(true)

    const payload =
      accountType === 'natural'
        ? {
            accountType,
            fullName: form.fullName,
            email: form.email,
            password: form.password,
            phone: form.phone || undefined,
          }
        : {
            accountType,
            fullName: form.fullName,
            email: form.email,
            password: form.password,
            phone: form.phone || undefined,
            companyName: form.companyName,
            legalName: form.legalName,
            nit: form.nit,
            checkDigit: form.checkDigit,
            cityId: form.cityId || undefined,
            chamberOfCommerce: form.chamberOfCommerce || undefined,
          }

    try {
      const res = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'No pudimos crear la cuenta')
        return
      }

      router.push(accountType === 'company' ? '/mi-empresa' : '/buscar')
      router.refresh()
    } catch {
      setError('No pudimos crear la cuenta')
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6" data-testid="register-form">
      <div className="flex gap-2 rounded-[var(--radius-input)] bg-[var(--color-background)] p-1">
        {(
          [
            { value: 'company', label: 'Empresa', icon: Building2 },
            { value: 'natural', label: 'Persona natural', icon: User },
          ] as const
        ).map((option) => {
          const active = accountType === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setAccountType(option.value)}
              data-testid={`account-type-${option.value}`}
              aria-pressed={active}
              className={cn(
                'relative flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-[var(--radius-input)] text-[14px] font-medium transition-colors',
                active ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]',
              )}
            >
              {active && motionEnabled ? (
                <motion.span
                  layoutId="account-type"
                  transition={tabIndicatorTransition}
                  className="pointer-events-none absolute inset-0 rounded-[var(--radius-input)] bg-white shadow-[var(--shadow-card)]"
                />
              ) : null}
              <option.icon className="relative size-4" aria-hidden />
              <span className="relative">{option.label}</span>
            </button>
          )
        })}
      </div>

      <section className="space-y-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5">
        <h2 className="text-[18px] font-semibold text-[var(--color-navy)]">Tus datos</h2>

        <Field label="Nombre completo" required value={form.fullName} onChange={(v) => set('fullName', v)} testId="reg-name" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Correo" type="email" required value={form.email} onChange={(v) => set('email', v)} testId="reg-email" />
          <Field label="Telefono" type="tel" value={form.phone} onChange={(v) => set('phone', v)} testId="reg-phone" />
        </div>
        <Field
          label="Contrasena"
          type="password"
          required
          value={form.password}
          onChange={(v) => set('password', v)}
          testId="reg-password"
          hint="Minimo 8 caracteres"
        />
      </section>

      <AnimatePresence initial={false}>
        {accountType === 'company' ? (
          <motion.div
            variants={motionEnabled ? accordionVariants : undefined}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="overflow-hidden"
          >
            <section
              className="space-y-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5"
              data-testid="company-fields"
            >
              <div>
                <h2 className="text-[18px] font-semibold text-[var(--color-navy)]">Datos de la empresa</h2>
                <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
                  Validamos el NIT para otorgar el distintivo de empresa verificada.
                </p>
              </div>

              <Field label="Nombre comercial" required value={form.companyName} onChange={(v) => set('companyName', v)} testId="reg-company" />
              <Field label="Razon social" required value={form.legalName} onChange={(v) => set('legalName', v)} testId="reg-legal" />

              <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                <Field
                  label="NIT"
                  required
                  value={form.nit}
                  onChange={(v) => set('nit', v)}
                  testId="reg-nit"
                  placeholder="900123456"
                />
                <Field
                  label="Digito"
                  required
                  value={form.checkDigit}
                  onChange={(v) => set('checkDigit', v.replace(/\D/g, '').slice(0, 1))}
                  testId="reg-check-digit"
                  placeholder="0"
                />
              </div>

              {suggestedDigit !== null ? (
                <p
                  className={cn(
                    'text-[12px]',
                    digitMismatch ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]',
                  )}
                  data-testid="digit-hint"
                >
                  {digitMismatch
                    ? `El digito de verificacion para ese NIT es ${suggestedDigit}.`
                    : form.checkDigit
                      ? 'El digito de verificacion coincide.'
                      : `El digito de verificacion para ese NIT es ${suggestedDigit}.`}
                </p>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Ciudad"
                  value={form.cityId}
                  onChange={(v) => set('cityId', v)}
                  options={cities.map((c) => ({ value: c.id, label: c.name }))}
                  testId="reg-city"
                />
                <Field
                  label="Camara de Comercio"
                  value={form.chamberOfCommerce}
                  onChange={(v) => set('chamberOfCommerce', v)}
                  testId="reg-chamber"
                />
              </div>

              <p className="flex items-start gap-2 rounded-[var(--radius-input)] bg-[var(--color-primary-soft)] p-3 text-[12px] text-[var(--color-primary)]">
                <BadgeCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
                Si el NIT es valido y la empresa figura activa, el distintivo queda activo de inmediato.
                Si no, un administrador revisa el caso.
              </p>
            </section>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {error ? (
          <motion.p
            variants={motionEnabled ? toastVariants : undefined}
            initial="hidden"
            animate="show"
            exit="exit"
            className="flex items-start gap-2 rounded-[var(--radius-input)] bg-red-50 p-3 text-[14px] text-[var(--color-danger)]"
            data-testid="register-error"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <Button type="submit" size="lg" className="w-full" loading={sending} data-testid="register-submit">
        Crear cuenta
      </Button>
    </form>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder,
  hint,
  testId,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
  placeholder?: string
  hint?: string
  testId: string
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-medium text-[var(--color-navy)]">
        {label}
        {required ? <span className="text-[var(--color-danger)]"> *</span> : null}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testId}
        className="mt-1 h-11 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] px-3 text-[14px] transition-colors"
      />
      {hint ? <span className="mt-1 block text-[12px] text-[var(--color-text-muted)]">{hint}</span> : null}
    </label>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
  testId,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  testId: string
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-medium text-[var(--color-navy)]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testId}
        className="mt-1 h-11 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white px-3 text-[14px] transition-colors"
      >
        <option value="">Selecciona</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
