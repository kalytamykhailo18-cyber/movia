import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { BulkUploader } from '@/components/bulk-uploader'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Carga masiva de publicaciones' }

export default async function BulkUploadPage() {
  const categories = await db.category.findMany({
    where: { active: true },
    orderBy: { position: 'asc' },
    select: { id: true, slug: true, name: true },
  })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-[32px] font-bold text-[var(--color-navy)]">Carga masiva</h1>
        <p className="mt-2 text-[16px] text-[var(--color-text-muted)]">
          Sube tu inventario completo en un archivo CSV. Validamos cada fila y te mostramos los errores
          antes de publicar.
        </p>
      </header>

      <BulkUploader categories={categories} />
    </div>
  )
}
