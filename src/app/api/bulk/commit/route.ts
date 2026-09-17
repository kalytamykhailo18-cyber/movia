import { NextResponse } from 'next/server'
import { z } from 'zod'
import { commitBulkRows, type BulkPreview } from '@/server/bulk-upload'
import { getSessionUser } from '@/lib/auth'

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
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Debes iniciar sesion para publicar' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Datos invalidos' }, { status: 400 })
  }

  // El inventario queda a nombre de la empresa de quien lo sube.
  const companyId = user.companyId
  if (!companyId) {
    return NextResponse.json(
      { error: 'La carga masiva es para cuentas de empresa' },
      { status: 403 },
    )
  }

  const preview = parsed.data.preview as BulkPreview
  if (preview.validRows === 0) {
    return NextResponse.json({ error: 'No hay filas validas para publicar' }, { status: 409 })
  }

  const result = await commitBulkRows(companyId, preview)
  return NextResponse.json({ ok: true, ...result }, { status: 201 })
}
