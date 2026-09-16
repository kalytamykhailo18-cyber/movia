import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { AdminNav } from '@/components/admin/admin-nav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect('/ingresar')
  if (user.role !== 'admin') redirect('/mi-empresa')

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <AdminNav />
      <div className="min-w-0">{children}</div>
    </div>
  )
}
