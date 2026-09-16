import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

const schema = z.object({ status: z.enum(['active', 'suspended']) })

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  let admin
  try {
    admin = await requireAdmin()
  } catch (e) {
    const code = (e as Error).message
    return NextResponse.json(
      { error: code === 'FORBIDDEN' ? 'Requiere permisos de administrador' : 'Debes iniciar sesion' },
      { status: code === 'FORBIDDEN' ? 403 : 401 },
    )
  }

  const { id } = await ctx.params
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Datos invalidos' }, { status: 400 })

  if (id === admin.id) {
    return NextResponse.json({ error: 'No puedes suspender tu propia cuenta' }, { status: 409 })
  }

  const user = await db.user.findUnique({ where: { id }, select: { id: true, status: true } })
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  await db.user.update({ where: { id }, data: { status: parsed.data.status } })

  await db.auditLog.create({
    data: {
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'user_status',
      entity: 'user',
      entityId: id,
      payload: JSON.stringify({ from: user.status, to: parsed.data.status }),
    },
  })

  return NextResponse.json({ ok: true, status: parsed.data.status })
}
