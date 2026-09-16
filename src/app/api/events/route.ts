import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const schema = z.object({
  publicationId: z.string().min(1),
  type: z.enum(['view', 'favorite', 'share', 'gallery_open', 'spec_open']),
  sessionId: z.string().max(80).optional(),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos invalidos' }, { status: 400 })
  }

  const { publicationId, type, sessionId } = parsed.data

  const exists = await db.publication.findUnique({
    where: { id: publicationId },
    select: { id: true },
  })
  if (!exists) return NextResponse.json({ error: 'Publicacion no encontrada' }, { status: 404 })

  if (type === 'view' && sessionId) {
    const seen = await db.analyticsEvent.findFirst({
      where: {
        publicationId,
        type: 'view',
        sessionId,
        createdAt: { gte: new Date(Date.now() - 1800000) },
      },
      select: { id: true },
    })
    if (seen) return NextResponse.json({ ok: true, deduped: true })
  }

  await db.$transaction([
    db.analyticsEvent.create({ data: { publicationId, type, sessionId: sessionId ?? null } }),
    ...(type === 'view'
      ? [db.publication.update({ where: { id: publicationId }, data: { viewCount: { increment: 1 } } })]
      : []),
    ...(type === 'favorite'
      ? [db.publication.update({ where: { id: publicationId }, data: { favoriteCount: { increment: 1 } } })]
      : []),
  ])

  return NextResponse.json({ ok: true })
}
