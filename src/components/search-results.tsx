'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchX } from 'lucide-react'
import { PublicationCard, type PublicationCardData } from '@/components/publication-card'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { listVariants, motionEnabled } from '@/lib/motion'

const SORTS = [
  { value: '', label: 'Mas relevantes' },
  { value: 'price_asc', label: 'Menor precio' },
  { value: 'price_desc', label: 'Mayor precio' },
  { value: 'views', label: 'Mas vistos' },
]

export function SearchResults({
  items,
  total,
  page,
  totalPages,
  pageSize,
  query,
}: {
  items: PublicationCardData[]
  total: number
  page: number
  totalPages: number
  pageSize: number
  query: string
}) {
  const router = useRouter()
  const params = useSearchParams()

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString())
    if (value === null || value === '') next.delete(key)
    else next.set(key, value)
    router.push(`/buscar?${next.toString()}`)
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-semibold text-[var(--color-navy)]">
            {query ? `Resultados para "${query}"` : 'Todos los activos'}
          </h1>
          <p className="text-[14px] text-[var(--color-text-muted)]" data-testid="result-count">
            {total} {total === 1 ? 'publicacion encontrada' : 'publicaciones encontradas'}
          </p>
        </div>

        <select
          value={params.get('sort') ?? ''}
          onChange={(e) => setParam('sort', e.target.value || null)}
          aria-label="Ordenar resultados"
          data-testid="sort-select"
          className="h-11 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white px-3 text-[14px] outline-none focus:border-[var(--color-primary)]"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        label="publicaciones"
        compact
        testId="pagination-top"
      />

      <div className="mt-4" />

      <AnimatePresence mode="wait">
        {items.length ? (
          <motion.div
            key={`${query}-${page}-${params.toString()}`}
            variants={motionEnabled ? listVariants : undefined}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
            data-testid="results-grid"
          >
            {items.map((item, i) => (
              <PublicationCard key={item.id} item={item} index={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] bg-white px-6 py-16 text-center"
            data-testid="empty-state"
          >
            <SearchX className="size-10 text-[var(--color-text-muted)]" aria-hidden />
            <h2 className="mt-3 text-[18px] font-semibold text-[var(--color-navy)]">
              No encontramos activos con esos criterios
            </h2>
            <p className="mt-1 max-w-sm text-[14px] text-[var(--color-text-muted)]">
              Prueba con menos filtros o guarda esta busqueda para recibir un aviso cuando aparezca algo
              que coincida.
            </p>
            <Button variant="secondary" className="mt-4" onClick={() => router.push('/buscar')}>
              Limpiar busqueda
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8">
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          label="publicaciones"
        />
      </div>

    </div>
  )
}
