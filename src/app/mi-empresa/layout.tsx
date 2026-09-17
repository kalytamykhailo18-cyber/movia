import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect('/ingresar?destino=%2Fmi-empresa')

  // Una persona natural no tiene panel de empresa. Antes se la mandaba al
  // ingreso, que al ver la sesion la devolvia aqui, en bucle.
  const puedeVerPanel = Boolean(user.companyId) || user.role === 'admin'

  if (!puedeVerPanel) {
    return (
      <div
        className="mx-auto max-w-lg rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] bg-white p-10 text-center"
        data-testid="panel-requiere-empresa"
      >
        <h1 className="text-[24px] font-bold text-[var(--color-navy)]">Panel de empresa</h1>
        <p className="mt-2 text-[15px] text-[var(--color-text-muted)]">
          Tu cuenta es de persona natural. El panel con publicaciones, contactos y analitica
          corresponde a las cuentas de empresa registradas con NIT.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Link
            href="/buscar"
            className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-input)] bg-[var(--color-primary)] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)]"
          >
            Explorar activos
          </Link>
          <Link
            href="/registro"
            className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-input)] border border-[#D1D5DB] bg-white px-5 text-[14px] font-medium text-[var(--color-navy)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            Registrar una empresa
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <DashboardNav />
      <div className="min-w-0">{children}</div>
    </div>
  )
}
