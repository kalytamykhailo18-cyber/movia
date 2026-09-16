import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { commitBulkRows, type BulkPreview } from '@/server/bulk-upload'

const schema = z.object({
  companyId: z.string().min(1).optional(),
  preview: z.object({
    totalRows: z.number(),
    validRows: z.number(),
    invalidRows: z.number(),
    issues: z.array(z.any()),
    rows: z.array(z.any()),
  }),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos invalidos' }, { status: 400 })
  }

  const companyId =
    parsed.data.companyId ??
    (await db.company.findFirst({ where: { verificationStatus: 'approved' }, select: { id: true } }))?.id

  if (!companyId) {
    return NextResponse.json({ error: 'No hay empresa disponible' }, { status: 404 })
  }

  const preview = parsed.data.preview as BulkPreview
  if (preview.validRows === 0) {
    return NextResponse.json({ error: 'No hay filas validas para publicar' }, { status: 409 })
  }

  const result = await commitBulkRows(companyId, preview)
  return NextResponse.json({ ok: true, ...result }, { status: 201 })
}
