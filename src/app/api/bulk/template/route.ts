import { NextResponse } from 'next/server'
import { buildTemplateCsv } from '@/server/bulk-upload'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const category = url.searchParams.get('categoria') ?? undefined
  const csv = buildTemplateCsv(category)
  const name = category ? `movia-plantilla-${category}.csv` : 'movia-plantilla.csv'

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${name}"`,
    },
  })
}
