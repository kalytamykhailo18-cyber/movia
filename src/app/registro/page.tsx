import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'
import { RegisterForm } from '@/components/register-form'
import { PageIntro } from '@/components/page-intro'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Crear cuenta' }

export default async function RegisterPage() {
  if (await getSessionUser()) redirect('/mi-empresa')

  const cities = await db.city.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageIntro>
        <h1 className="text-[32px] font-bold text-[var(--color-navy)]">Crear cuenta</h1>
        <p className="mt-2 text-[16px] text-[var(--color-text-muted)]">
          Publica los activos que tu empresa ya no usa y recibe contactos de compradores.
        </p>
      </PageIntro>

      <RegisterForm cities={cities} />

      <p className="text-center text-[14px] text-[var(--color-text-muted)]">
        Ya tienes cuenta?{' '}
        <Link href="/ingresar" className="font-medium text-[var(--color-primary)] hover:underline">
          Ingresar
        </Link>
      </p>
    </div>
  )
}
