'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { accordionVariants, drawerVariants, modalOverlayVariants, motionEnabled } from '@/lib/motion'
import { cn } from '@/lib/utils'

type Category = { id: string; slug: string; name: string; _count: { publications: number } }
type City = { id: string; name: string }

export function SearchFilters({
  categories,
  cities,
  conditions,
}: {
  categories: Category[]
  cities: City[]
  conditions: string[]
}) {
  const router = useRouter()
  const params = useSearchParams()
  const [open, setOpen] = useState(false)

  const apply = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString())
      if (value === null || value === '') next.delete(key)
      else next.set(key, value)
      next.delete('page')
      router.push(`/buscar?${next.toString()}`)
    },
    [params, router],
  )

  const activeCount = ['category', 'city', 'condition', 'minPrice', 'maxPrice', 'minYear'].filter((k) =>
    params.get(k),
  ).length

  const content = (
    <div className="space-y-5" data-testid="search-filters">
      <FilterGroup title="Categoria" defaultOpen>
        <div className="space-y-1">
          <FilterOption
            label="Todas"
            active={!params.get('category')}
            onClick={() => apply('category', null)}
          />
          {categories.map((cat) => (
            <FilterOption
              key={cat.id}
              label={cat.name}
              count={cat._count.publications}
              active={params.get('category') === cat.slug}
              onClick={() => apply('category', cat.slug)}
              testId={`filter-category-${cat.slug}`}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Ciudad">
        <select
          value={params.get('city') ?? ''}
          onChange={(e) => apply('city', e.target.value || null)}
          data-testid="filter-city"
          aria-label="Filtrar por ciudad"
          className="h-11 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white px-3 text-[14px] outline-none focus:border-[var(--color-primary)]"
        >
          <option value="">Todas las ciudades</option>
          {cities.map((city) => (
            <option key={city.id} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup title="Condicion">
        <select
          value={params.get('condition') ?? ''}
          onChange={(e) => apply('condition', e.target.value || null)}
          data-testid="filter-condition"
          aria-label="Filtrar por condicion"
          className="h-11 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white px-3 text-[14px] outline-none focus:border-[var(--color-primary)]"
        >
          <option value="">Cualquier condicion</option>
          {conditions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </FilterGroup>

      <FilterGroup title="Precio">
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Minimo"
            aria-label="Precio minimo"
            data-testid="filter-min-price"
            defaultValue={params.get('minPrice') ?? ''}
            onBlur={(e) => apply('minPrice', e.target.value || null)}
            className="h-11 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] px-3 text-[14px] outline-none focus:border-[var(--color-primary)]"
          />
          <input
            type="number"
            inputMode="numeric"
            placeholder="Maximo"
            aria-label="Precio maximo"
            data-testid="filter-max-price"
            defaultValue={params.get('maxPrice') ?? ''}
            onBlur={(e) => apply('maxPrice', e.target.value || null)}
            className="h-11 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] px-3 text-[14px] outline-none focus:border-[var(--color-primary)]"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Ano minimo">
        <input
          type="number"
          inputMode="numeric"
          placeholder="Ej 2015"
          aria-label="Ano minimo"
          data-testid="filter-min-year"
          defaultValue={params.get('minYear') ?? ''}
          onBlur={(e) => apply('minYear', e.target.value || null)}
          className="h-11 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] px-3 text-[14px] outline-none focus:border-[var(--color-primary)]"
        />
      </FilterGroup>

      {activeCount > 0 ? (
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          data-testid="clear-filters"
          onClick={() => router.push(params.get('q') ? `/buscar?q=${params.get('q')}` : '/buscar')}
        >
          Limpiar filtros ({activeCount})
        </Button>
      ) : null}
    </div>
  )

  return (
    <>
      <aside className="hidden lg:block">
        <div className="sticky top-24 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4">
          {content}
        </div>
      </aside>

      <div className="lg:hidden">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => setOpen(true)}
          data-testid="open-filters"
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          Filtros{activeCount ? ` (${activeCount})` : ''}
        </Button>
      </div>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              variants={modalOverlayVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-[var(--color-navy)]/40 lg:hidden"
            />
            <motion.div
              variants={drawerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="movia-scrollbar fixed inset-y-0 left-0 z-50 w-[300px] overflow-y-auto border-r border-[var(--color-border)] bg-white p-4 lg:hidden"
              data-testid="filters-drawer"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[18px] font-semibold text-[var(--color-navy)]">Filtros</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar filtros"
                  className="inline-flex size-11 items-center justify-center rounded-[var(--radius-input)]"
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>
              {content}
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  )
}

function FilterGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-[var(--color-border)] pb-4 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-1 text-left"
      >
        <span className="text-[14px] font-semibold text-[var(--color-navy)]">{title}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="size-4 text-[var(--color-text-muted)]" aria-hidden />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            variants={motionEnabled ? accordionVariants : undefined}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="overflow-hidden"
          >
            <div className="pt-2">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function FilterOption({
  label,
  count,
  active,
  onClick,
  testId,
}: {
  label: string
  count?: number
  active: boolean
  onClick: () => void
  testId?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      aria-pressed={active}
      className={cn(
        'flex w-full items-center justify-between rounded-[var(--radius-input)] px-2 py-2 text-left text-[14px] transition-colors',
        active
          ? 'bg-[var(--color-primary-soft)] font-medium text-[var(--color-primary)]'
          : 'text-[var(--color-navy)] hover:bg-[var(--color-background)]',
      )}
    >
      <span>{label}</span>
      {typeof count === 'number' ? (
        <span className="text-[12px] text-[var(--color-text-muted)]">{count}</span>
      ) : null}
    </button>
  )
}
