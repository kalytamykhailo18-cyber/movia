import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { UserList } from '@/components/admin/decision-list'
import { Pagination } from '@/components/ui/pagination'
import { resolvePage, pageMeta } from '@/lib/paginate'
import { env } from '@/lib/env'
import { PageIntro } from '@/components/page-intro'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Usuarios' }

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function AdminUsersPage({ searchParams }: Props) {
  const admin = await requireAdmin()
  const query = await searchParams
  const pagina = resolvePage(query.page, env.search.listPageSize)
  const total = await db.user.count()
  const meta = pageMeta(total, pagina)

  const users = await db.user.findMany({
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    skip: pagina.skip,
    take: pagina.take,
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
      <PageIntro>
        <h1 className="text-[28px] font-bold text-[var(--color-navy)]">Usuarios</h1>
        <p className="mt-1 text-[16px] text-[var(--color-text-muted)]">
          Un usuario suspendido no puede iniciar sesion.
        </p>
      </PageIntro>

      <Pagination
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        pageSize={meta.pageSize}
        label="usuarios"
        testId="pagination-top"
      />

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

      <Pagination
        page={meta.page}
        totalPages={meta.totalPages}
        total={meta.total}
        pageSize={meta.pageSize}
        label="usuarios"
      />
    </div>
  )
}
