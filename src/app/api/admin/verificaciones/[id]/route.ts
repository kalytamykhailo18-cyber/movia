import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { parseJson } from '@/lib/utils'

const schema = z.object({
  decision: z.enum(['approved', 'rejected']),
  note: z.string().trim().max(500).optional(),
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
  const parsed = schema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Datos invalidos' }, { status: 400 })

  const company = await db.company.findUnique({
    where: { id },
    select: { id: true, badges: true, verificationStatus: true },
  })
  if (!company) return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 })

  const approved = parsed.data.decision === 'approved'
  const badges = parseJson<string[]>(company.badges, [])
  const nextBadges = approved
    ? Array.from(new Set([...badges, 'verified']))
    : badges.filter((b) => b !== 'verified')

  await db.company.update({
    where: { id },
    data: {
      verificationStatus: parsed.data.decision,
      verificationNote: parsed.data.note ?? null,
      verifiedAt: approved ? new Date() : null,
      badges: JSON.stringify(nextBadges),
    },
  })

  await db.auditLog.create({
    data: {
      actorId: admin.id,
      actorEmail: admin.email,
      action: 'company_verification',
      entity: 'company',
      entityId: id,
      payload: JSON.stringify({ from: company.verificationStatus, to: parsed.data.decision, note: parsed.data.note }),
    },
  })

  return NextResponse.json({ ok: true, status: parsed.data.decision })
}
