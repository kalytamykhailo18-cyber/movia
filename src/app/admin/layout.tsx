import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { AdminNav } from '@/components/admin/admin-nav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect('/ingresar?destino=%2Fadmin')
  // Se devuelve a donde esa cuenta si puede estar.
  if (user.role !== 'admin') redirect(user.companyId ? '/mi-empresa' : '/buscar')

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <AdminNav />
      <div className="min-w-0">{children}</div>
    </div>
  )
}
