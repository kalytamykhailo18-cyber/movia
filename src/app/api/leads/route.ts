import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const schema = z.object({
  publicationId: z.string().min(1),
  source: z.enum(['whatsapp', 'chat', 'email']),
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().email().max(160).optional(),
  phone: z.string().trim().max(40).optional(),
  message: z.string().trim().max(2000).optional(),
})

const EVENT_BY_SOURCE = {
  whatsapp: 'whatsapp_click',
  email: 'email_click',
  chat: 'chat_start',
} as const

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos invalidos', issues: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data
  const publication = await db.publication.findUnique({
    where: { id: data.publicationId },
    select: { id: true, status: true, firstContactAt: true },
  })

  if (!publication) {
    return NextResponse.json({ error: 'Publicacion no encontrada' }, { status: 404 })
  }
  if (publication.status !== 'active') {
    return NextResponse.json({ error: 'La publicacion no esta activa' }, { status: 409 })
  }

  const now = new Date()

  const [lead] = await db.$transaction([
    db.lead.create({
      data: {
        publicationId: data.publicationId,
        source: data.source,
        name: data.name ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        message: data.message ?? null,
      },
    }),
    db.analyticsEvent.create({
      data: { publicationId: data.publicationId, type: EVENT_BY_SOURCE[data.source] },
    }),
    db.publication.update({
      where: { id: data.publicationId },
      data: {
        leadCount: { increment: 1 },
        ...(publication.firstContactAt ? {} : { firstContactAt: now }),
      },
    }),
  ])

  return NextResponse.json({ ok: true, leadId: lead.id }, { status: 201 })
}
