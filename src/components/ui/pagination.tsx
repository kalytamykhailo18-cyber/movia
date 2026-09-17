'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motionEnabled, tabIndicatorTransition } from '@/lib/motion'

type Props = {
  page: number
  totalPages: number
  total: number
  pageSize: number
  param?: string
  compact?: boolean
  label?: string
  testId?: string
}

// Devuelve las paginas a mostrar con puntos suspensivos donde se saltan tramos:
// 1 … 4 5 [6] 7 8 … 20
function pageWindow(page: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)

  const pages = new Set<number>([1, totalPages, page])
  for (const offset of [-1, 1]) {
    const candidate = page + offset
    if (candidate > 1 && candidate < totalPages) pages.add(candidate)
  }
  if (page <= 3) for (const n of [2, 3, 4]) if (n < totalPages) pages.add(n)
  if (page >= totalPages - 2) {
    for (const n of [totalPages - 3, totalPages - 2, totalPages - 1]) if (n > 1) pages.add(n)
  }

  const ordered = [...pages].sort((a, b) => a - b)
  const withGaps: (number | 'gap')[] = []

  ordered.forEach((value, index) => {
    if (index > 0 && value - ordered[index - 1] > 1) withGaps.push('gap')
    withGaps.push(value)
  })

  return withGaps
}

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  param = 'page',
  compact = false,
  label = 'resultados',
  testId = 'pagination',
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  if (totalPages <= 1) return null

  const desde = (page - 1) * pageSize + 1
  const hasta = Math.min(page * pageSize, total)

  function go(next: number) {
    const query = new URLSearchParams(params.toString())
    if (next <= 1) query.delete(param)
    else query.set(param, String(next))

    const search = query.toString()
    router.push(search ? `${pathname}?${search}` : pathname, { scroll: true })
  }

  return (
    <nav
      className={cn(
        'flex flex-wrap items-center justify-between gap-3',
        compact ? 'pb-1' : 'pt-2',
      )}
      aria-label="Paginacion"
      data-testid={testId}
    >
      <p className="text-[13px] text-[var(--color-text-muted)]" data-testid={`${testId}-range`}>
        Mostrando <span className="font-medium text-[var(--color-navy)]">{desde}</span>
        {' a '}
        <span className="font-medium text-[var(--color-navy)]">{hasta}</span>
        {' de '}
        <span className="font-medium text-[var(--color-navy)]">{total}</span> {label}
      </p>

      <div className="flex items-center gap-1">
        <Arrow
          side="prev"
          disabled={page <= 1}
          onClick={() => go(page - 1)}
          testId={`${testId}-prev`}
        />

        {compact ? (
          <span
            className="px-3 text-[13px] text-[var(--color-text-muted)]"
            data-testid={`${testId}-indicator`}
          >
            {page} de {totalPages}
          </span>
        ) : (
          <ul className="flex items-center gap-1" data-testid={`${testId}-pages`}>
            {pageWindow(page, totalPages).map((value, index) =>
              value === 'gap' ? (
                <li
                  key={`gap-${index}`}
                  aria-hidden
                  className="px-1 text-[13px] text-[var(--color-text-muted)]"
                >
                  &hellip;
                </li>
              ) : (
                <li key={value}>
                  <button
                    type="button"
                    onClick={() => go(value)}
                    aria-current={value === page ? 'page' : undefined}
                    aria-label={`Pagina ${value}`}
                    data-testid={`${testId}-page-${value}`}
                    className={cn(
                      'relative inline-flex size-11 items-center justify-center rounded-[var(--radius-input)] text-[14px] tabular-nums transition-colors',
                      value === page
                        ? 'font-semibold text-white'
                        : 'text-[var(--color-navy)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]',
                    )}
                  >
                    {value === page && motionEnabled ? (
                      <motion.span
                        layoutId={`${testId}-active`}
                        transition={tabIndicatorTransition}
                        className="pointer-events-none absolute inset-0 rounded-[var(--radius-input)] bg-[var(--color-primary)]"
                      />
                    ) : value === page ? (
                      <span className="pointer-events-none absolute inset-0 rounded-[var(--radius-input)] bg-[var(--color-primary)]" />
                    ) : null}
                    <span className="relative">{value}</span>
                  </button>
                </li>
              ),
            )}
          </ul>
        )}

        <Arrow
          side="next"
          disabled={page >= totalPages}
          onClick={() => go(page + 1)}
          testId={`${testId}-next`}
        />
      </div>
    </nav>
  )
}

function Arrow({
  side,
  disabled,
  onClick,
  testId,
}: {
  side: 'prev' | 'next'
  disabled: boolean
  onClick: () => void
  testId: string
}) {
  const Icon = side === 'prev' ? ChevronLeft : ChevronRight

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === 'prev' ? 'Pagina anterior' : 'Pagina siguiente'}
      data-testid={testId}
      className={cn(
        'inline-flex size-11 items-center justify-center rounded-[var(--radius-input)] border transition-colors',
        disabled
          ? 'cursor-not-allowed border-[var(--color-border)] text-[var(--color-border)]'
          : 'border-[#D1D5DB] text-[var(--color-navy)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]',
      )}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  )
}
