import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { UserList } from '@/components/admin/decision-list'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Usuarios' }

export default async function AdminUsersPage() {
  const admin = await requireAdmin()

  const users = await db.user.findMany({
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    take: 100,
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      accountType: true,
      status: true,
      company: { select: { name: true } },
    },
  })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[28px] font-bold text-[var(--color-navy)]">Usuarios</h1>
        <p className="mt-1 text-[16px] text-[var(--color-text-muted)]">
          Un usuario suspendido no puede iniciar sesion.
        </p>
      </header>

      <UserList
        currentUserId={admin.id}
        users={users.map((u) => ({
          id: u.id,
          email: u.email,
          fullName: u.fullName,
          role: u.role,
          accountType: u.accountType,
          status: u.status,
          companyName: u.company?.name ?? null,
        }))}
      />
    </div>
  )
}
