'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Factory,
  Wrench,
  Truck,
  HardHat,
  UtensilsCrossed,
  Armchair,
  Cpu,
  Package,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import { listVariants, cardVariants, motionEnabled } from '@/lib/motion'

const ICONS: Record<string, LucideIcon> = {
  Factory,
  Wrench,
  Truck,
  HardHat,
  UtensilsCrossed,
  Armchair,
  Cpu,
  Package,
}

type CategoryItem = {
  id: string
  slug: string
  name: string
  icon: string
  _count: { publications: number }
}

// Un indice de catalogo de repuestos, no ocho tarjetas con icono: el nombre a
// la izquierda, el conteo tabulado a la derecha y filete de base. Pero un
// indice tiene que parecer accionable, asi que va dentro de un panel propio y
// cada fila lleva su glifo y su cheuron.
export function CategoryGrid({ categories }: { categories: CategoryItem[] }) {
  return (
    <motion.div
      variants={motionEnabled ? listVariants : undefined}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)] lg:grid-cols-2"
      data-testid="category-grid"
    >
      {categories.map((cat, i) => {
        const Icon = ICONS[cat.icon] ?? Package
        // Las dos ultimas filas cierran el panel, sin filete inferior. En una
        // sola columna solo la ultima.
        const ultimasDos = i >= categories.length - 2
        return (
          <motion.div
            key={cat.id}
            variants={motionEnabled ? cardVariants : undefined}
            className="contents"
          >
            <Link
              href={`/buscar?category=${cat.slug}`}
              data-testid="category-item"
              className={[
                'group/fila flex min-h-16 items-center gap-3 px-[var(--pad-cell)] transition-colors sm:px-[var(--pad-panel)]',
                'border-b border-[var(--color-border)] hover:bg-[var(--color-primary-soft)]',
                'lg:odd:border-r',
                ultimasDos ? 'lg:border-b-0' : '',
                i === categories.length - 1 ? 'border-b-0' : '',
              ].join(' ')}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-[var(--radius-input)] bg-[var(--color-primary-soft)] transition-colors group-hover/fila:bg-[#DBEAFE]">
                <Icon className="size-[17px] text-[var(--color-primary)]" />
              </span>

              <span className="whitespace-nowrap text-[15px] font-semibold text-[var(--color-navy)]">
                {cat.name}
              </span>

              {/* El filete guia lleva el ojo del nombre a la cifra, como en el
                  indice de un catalogo. */}
              <span className="min-w-4 flex-1 -translate-y-[3px] border-b border-dotted border-[#cbd5e1]" aria-hidden />

              <span className="text-[15px] font-bold tabular-nums text-[var(--color-navy)]">
                {cat._count.publications}
              </span>

              <ChevronRight
                className="size-[15px] shrink-0 text-[#b6c2d4] transition-[color,transform] group-hover/fila:translate-x-0.5 group-hover/fila:text-[var(--color-primary)]"
                aria-hidden
              />
            </Link>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
