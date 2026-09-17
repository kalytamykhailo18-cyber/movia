import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { verifyPassword, createSession } from '@/lib/auth'

const schema = z.object({
  email: z.string().email().max(160),
  password: z.string().min(1).max(100),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos invalidos' }, { status: 400 })
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    select: { id: true, passwordHash: true, status: true, role: true, companyId: true },
  })

  // Mismo mensaje para correo inexistente y clave incorrecta: no revela cuentas.
  const invalid = NextResponse.json({ error: 'Correo o contrasena incorrectos' }, { status: 401 })
  if (!user) return invalid

  const ok = await verifyPassword(parsed.data.password, user.passwordHash)
  if (!ok) return invalid

  if (user.status !== 'active') {
    return NextResponse.json({ error: 'Esta cuenta esta suspendida' }, { status: 403 })
  }

  await createSession(user.id)

  // Una persona natural no tiene panel de empresa: mandarla alli la dejaba
  // rebotando entre el panel y el ingreso.
  const destino = user.role === 'admin' ? '/admin' : user.companyId ? '/mi-empresa' : '/buscar'

  return NextResponse.json({ ok: true, role: user.role, destino })
}
