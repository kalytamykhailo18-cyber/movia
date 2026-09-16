'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toastVariants, motionEnabled } from '@/lib/motion'

export type PendingCompany = {
  id: string
  name: string
  legalName: string
  nit: string
  nitCheckDigit: string
  verificationStatus: string
  verificationNote: string | null
  cityName: string | null
  ownerEmail: string
}

export function VerificationQueue({ companies }: { companies: PendingCompany[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [done, setDone] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  async function decide(id: string, decision: 'approved' | 'rejected') {
    setError(null)
    setBusy(id)

    try {
      const res = await fetch(`/api/admin/verificaciones/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          note: decision === 'approved' ? 'Aprobada por revision manual' : 'Rechazada por revision manual',
        }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'No pudimos registrar la decision')
        return
      }

      setDone((d) => ({ ...d, [id]: decision }))
      router.refresh()
    } catch {
      setError('No pudimos registrar la decision')
    } finally {
      setBusy(null)
    }
  }

  if (!companies.length) {
    return (
      <p
        className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] bg-white p-10 text-center text-[14px] text-[var(--color-text-muted)]"
        data-testid="verifications-empty"
      >
        No hay verificaciones pendientes.
      </p>
    )
  }

  return (
    <div className="space-y-3" data-testid="verification-queue">
      <AnimatePresence>
        {error ? (
          <motion.p
            variants={motionEnabled ? toastVariants : undefined}
            initial="hidden"
            animate="show"
            exit="exit"
            className="rounded-[var(--radius-input)] bg-red-50 p-3 text-[14px] text-[var(--color-danger)]"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>

      {companies.map((company) => (
        <article
          key={company.id}
          className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5"
          data-testid="verification-row"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-[18px] font-semibold text-[var(--color-navy)]">{company.name}</h2>
              <p className="text-[13px] text-[var(--color-text-muted)]">{company.legalName}</p>
              <p className="mt-1 text-[13px] text-[var(--color-navy)]" data-testid="verification-nit">
                NIT {company.nit}-{company.nitCheckDigit}
                {company.cityName ? ` · ${company.cityName}` : ''}
              </p>
              <p className="text-[12px] text-[var(--color-text-muted)]">{company.ownerEmail}</p>
              {company.verificationNote ? (
                <p className="mt-2 text-[12px] text-[var(--color-text-muted)]">
                  {company.verificationNote}
                </p>
              ) : null}
            </div>

            {done[company.id] ? (
              <Badge tone={done[company.id] === 'approved' ? 'success' : 'danger'}>
                {done[company.id] === 'approved' ? 'Aprobada' : 'Rechazada'}
              </Badge>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  loading={busy === company.id}
                  onClick={() => decide(company.id, 'approved')}
                  data-testid={`approve-${company.nit}`}
                >
                  Aprobar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={busy === company.id}
                  onClick={() => decide(company.id, 'rejected')}
                  data-testid={`reject-${company.nit}`}
                >
                  Rechazar
                </Button>
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}

export type AdminUser = {
  id: string
  email: string
  fullName: string
  role: string
  accountType: string
  status: string
  companyName: string | null
}

export function UserList({ users, currentUserId }: { users: AdminUser[]; currentUserId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function toggle(user: AdminUser) {
    setError(null)
    setBusy(user.id)
    const next = user.status === 'active' ? 'suspended' : 'active'

    try {
      const res = await fetch(`/api/admin/usuarios/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'No pudimos actualizar el usuario')
        return
      }

      router.refresh()
    } catch {
      setError('No pudimos actualizar el usuario')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p
          className="rounded-[var(--radius-input)] bg-red-50 p-3 text-[14px] text-[var(--color-danger)]"
          data-testid="user-error"
        >
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white">
        <div className="movia-scrollbar overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[13px]" data-testid="users-table">
            <thead className="bg-[var(--color-background)] text-[12px] text-[var(--color-text-muted)]">
              <tr>
                <th className="px-5 py-2.5 font-medium">Usuario</th>
                <th className="px-5 py-2.5 font-medium">Empresa</th>
                <th className="px-5 py-2.5 font-medium">Rol</th>
                <th className="px-5 py-2.5 font-medium">Estado</th>
                <th className="px-5 py-2.5 font-medium">Accion</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-[var(--color-border)]" data-testid="user-row">
                  <td className="px-5 py-3">
                    <span className="font-medium text-[var(--color-navy)]">{user.fullName}</span>
                    <span className="block text-[12px] text-[var(--color-text-muted)]">{user.email}</span>
                  </td>
                  <td className="px-5 py-3 text-[var(--color-text-muted)]">{user.companyName ?? '-'}</td>
                  <td className="px-5 py-3">{user.role}</td>
                  <td className="px-5 py-3">
                    <Badge tone={user.status === 'active' ? 'success' : 'danger'}>
                      {user.status === 'active' ? 'Activo' : 'Suspendido'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    {user.id === currentUserId ? (
                      <span className="text-[12px] text-[var(--color-text-muted)]">Tu cuenta</span>
                    ) : (
                      <Button
                        size="sm"
                        variant={user.status === 'active' ? 'danger' : 'secondary'}
                        loading={busy === user.id}
                        onClick={() => toggle(user)}
                        data-testid={`toggle-${user.email}`}
                      >
                        {user.status === 'active' ? 'Suspender' : 'Reactivar'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
