'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Send, Check } from 'lucide-react'
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon'
import { Button } from '@/components/ui/button'
import { toastVariants, accordionVariants, motionEnabled } from '@/lib/motion'

type Mode = 'idle' | 'chat' | 'email'

export function ContactPanel({
  publicationId,
  publicationTitle,
  publicationSlug,
  sellerPhone,
  sellerEmail,
}: {
  publicationId: string
  publicationTitle: string
  publicationSlug: string
  sellerPhone: string | null
  sellerEmail: string | null
}) {
  const [mode, setMode] = useState<Mode>('idle')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })

  async function registerLead(source: 'whatsapp' | 'chat' | 'email', payload?: Record<string, string>) {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicationId, source, ...payload }),
    })
    if (!res.ok) throw new Error('No se pudo registrar el contacto')
  }

  async function onWhatsApp() {
    setError(null)
    try {
      await registerLead('whatsapp')
    } catch {
      // el contacto no debe bloquearse si falla la analitica
    }

    const phone = (sellerPhone ?? '').replace(/\D/g, '')
    const text = encodeURIComponent(
      `Hola, estoy interesado en "${publicationTitle}" publicado en MOVIA: ${window.location.origin}/publicacion/${publicationSlug}`,
    )
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener')
    setSent('whatsapp')
  }

  async function onSubmit(source: 'chat' | 'email') {
    setError(null)
    setSending(true)
    try {
      await registerLead(source, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
      })
      setSent(source)
      setMode('idle')
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch {
      setError('No pudimos enviar tu mensaje. Intenta de nuevo.')
    } finally {
      setSending(false)
    }
  }

  return (
    <section
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5"
      data-testid="contact-panel"
    >
      <h2 className="text-[18px] font-semibold text-[var(--color-navy)]">Contactar al vendedor</h2>
      <p className="mt-1 text-[13px] text-[var(--color-text-muted)]">
        Elige el canal que prefieras. El vendedor recibe tu contacto al instante.
      </p>

      <div className="mt-4 space-y-2">
        <Button
          className="w-full bg-[#16A34A] hover:bg-[#15803D]"
          onClick={onWhatsApp}
          disabled={!sellerPhone}
          data-testid="contact-whatsapp"
        >
          <WhatsAppIcon className="size-4" />
          WhatsApp
        </Button>

        <Button
          variant="secondary"
          className="w-full"
          onClick={() => setMode(mode === 'chat' ? 'idle' : 'chat')}
          data-testid="contact-message"
        >
          <Send className="size-4" aria-hidden />
          Enviar mensaje
        </Button>

        <Button
          variant="secondary"
          className="w-full"
          onClick={() => setMode(mode === 'email' ? 'idle' : 'email')}
          disabled={!sellerEmail}
          data-testid="contact-email"
        >
          <Mail className="size-4" aria-hidden />
          Enviar correo
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {mode !== 'idle' ? (
          <motion.form
            variants={motionEnabled ? accordionVariants : undefined}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="overflow-hidden"
            data-testid="contact-form"
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit(mode)
            }}
          >
            <div className="mt-4 space-y-3 border-t border-[var(--color-border)] pt-4">
              <Field
                label="Nombre"
                value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                testId="contact-name"
                required
              />
              <Field
                label="Correo"
                type="email"
                value={form.email}
                onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                testId="contact-email-input"
                required
              />
              <Field
                label="Telefono"
                type="tel"
                value={form.phone}
                onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                testId="contact-phone"
              />

              <label className="block">
                <span className="text-[13px] font-medium text-[var(--color-navy)]">Mensaje</span>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  data-testid="contact-message-input"
                  placeholder="Cuentale al vendedor que necesitas saber"
                  className="mt-1 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] p-3 text-[14px] outline-none transition-colors focus:border-[var(--color-primary)]"
                />
              </label>

              <Button type="submit" className="w-full" loading={sending} data-testid="contact-submit">
                Enviar
              </Button>
            </div>
          </motion.form>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {sent ? (
          <motion.p
            variants={motionEnabled ? toastVariants : undefined}
            initial="hidden"
            animate="show"
            exit="exit"
            className="mt-4 flex items-center gap-2 rounded-[var(--radius-input)] bg-green-50 p-3 text-[13px] text-[var(--color-success)]"
            data-testid="contact-success"
          >
            <Check className="size-4 shrink-0" aria-hidden />
            Contacto registrado. El vendedor lo vera en su panel.
          </motion.p>
        ) : null}
      </AnimatePresence>

      {error ? (
        <p className="mt-3 text-[13px] text-[var(--color-danger)]" data-testid="contact-error">
          {error}
        </p>
      ) : null}
    </section>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  testId,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
  testId: string
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-medium text-[var(--color-navy)]">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testId}
        className="mt-1 h-11 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] px-3 text-[14px] outline-none transition-colors focus:border-[var(--color-primary)]"
      />
    </label>
  )
}
