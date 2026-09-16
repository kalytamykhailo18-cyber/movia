import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

const schema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  price: z.number().min(0).optional(),
  durationDays: z.number().int().min(1).max(3650).optional(),
  publicationQuota: z.number().int().min(0).max(100000).optional(),
  featuredQuota: z.number().int().min(0).max(100000).optional(),
  active: z.boolean().optional(),
})

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
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos invalidos' }, { status: 400 })
  }

  const existing = await db.plan.findUnique({ where: { id }, select: { id: true, price: true } })
  if (!existing) return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })

  const plan = await db.plan.update({
    where: { id },
    data: parsed.data,
    select: { id: true, slug: true, name: true, price: true, active: true },
  })

  await db.auditLog.create({
    data: {
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'plan_update',
      entity: 'plan',
      entityId: plan.id,
      payload: JSON.stringify({ before: existing.price, after: plan.price, changes: parsed.data }),
    },
  })

  return NextResponse.json({ ok: true, plan })
}
