import type { Metadata } from 'next'
import Link from 'next/link'
import { Upload } from 'lucide-react'
import { db } from '@/lib/db'
import { PublishForm } from '@/components/publish-form'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Publicar un activo' }

export default async function PublishPage() {
  const [categories, cities] = await Promise.all([
    db.category.findMany({
      where: { active: true },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        attributes: {
          orderBy: { position: 'asc' },
          select: { id: true, key: true, label: true, type: true, unit: true, options: true, required: true },
        },
      },
    }),
    db.city.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold text-[var(--color-navy)]">Publicar un activo</h1>
          <p className="mt-2 text-[16px] text-[var(--color-text-muted)]">
            Mientras mas completa sea la publicacion, mas visibilidad y confianza genera.
          </p>
        </div>

        <Link
          href="/publicar/masivo"
          data-testid="go-bulk"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-input)] border border-[#D1D5DB] bg-white px-4 text-[14px] font-medium text-[var(--color-navy)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          <Upload className="size-4" aria-hidden />
          Carga masiva
        </Link>
      </header>

      <PublishForm categories={categories} cities={cities} />
    </div>
  )
}
