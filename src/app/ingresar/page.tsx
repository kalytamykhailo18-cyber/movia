import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { LoginForm } from '@/components/login-form'
import { PageIntro } from '@/components/page-intro'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Ingresar' }

export default async function LoginPage() {
  if (await getSessionUser()) redirect('/mi-empresa')

  return (
    <div className="mx-auto max-w-md space-y-6">
      <PageIntro>
        <h1 className="text-[32px] font-bold text-[var(--color-navy)]">Ingresar</h1>
        <p className="mt-2 text-[16px] text-[var(--color-text-muted)]">
          Accede a tu panel, tus publicaciones y tus contactos.
        </p>
      </PageIntro>

      <LoginForm />

      <p className="text-center text-[14px] text-[var(--color-text-muted)]">
        No tienes cuenta?{' '}
        <Link href="/registro" className="font-medium text-[var(--color-primary)] hover:underline">
          Crear cuenta
        </Link>
      </p>
    </div>
  )
}
