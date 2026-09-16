'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toastVariants, motionEnabled } from '@/lib/motion'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSending(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'No pudimos iniciar sesion')
        return
      }

      router.push(json.role === 'admin' ? '/admin' : '/mi-empresa')
      router.refresh()
    } catch {
      setError('No pudimos iniciar sesion')
    } finally {
      setSending(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5"
      data-testid="login-form"
    >
      <label className="block">
        <span className="text-[13px] font-medium text-[var(--color-navy)]">Correo</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          data-testid="login-email"
          className="mt-1 h-11 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] px-3 text-[14px] transition-colors"
        />
      </label>

      <label className="block">
        <span className="text-[13px] font-medium text-[var(--color-navy)]">Contrasena</span>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          data-testid="login-password"
          className="mt-1 h-11 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] px-3 text-[14px] transition-colors"
        />
      </label>

      <AnimatePresence>
        {error ? (
          <motion.p
            variants={motionEnabled ? toastVariants : undefined}
            initial="hidden"
            animate="show"
            exit="exit"
            className="flex items-start gap-2 rounded-[var(--radius-input)] bg-red-50 p-3 text-[14px] text-[var(--color-danger)]"
            data-testid="login-error"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <Button type="submit" size="lg" className="w-full" loading={sending} data-testid="login-submit">
        Ingresar
      </Button>
    </form>
  )
}
