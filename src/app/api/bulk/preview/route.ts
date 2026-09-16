import { NextResponse } from 'next/server'
import Papa from 'papaparse'
import { env } from '@/lib/env'
import { validateBulkRows } from '@/server/bulk-upload'

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null)
  const file = form?.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Adjunta un archivo CSV' }, { status: 400 })
  }

  if (file.size > env.bulk.maxFileMb * 1024 * 1024) {
    return NextResponse.json(
      { error: `El archivo supera ${env.bulk.maxFileMb} MB` },
      { status: 413 },
    )
  }

  const text = await file.text()
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim().toLowerCase(),
  })

  if (!parsed.data.length) {
    return NextResponse.json({ error: 'El archivo no tiene filas de datos' }, { status: 400 })
  }

  const preview = await validateBulkRows(parsed.data)
  return NextResponse.json(preview)
}
