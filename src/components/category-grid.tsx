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

// Ocho tarjetas cuadradas con mucho aire ocupaban una pantalla entera para
// decir ocho palabras. En fila densa el conteo pasa a ser un dato util y se
// recupera una pantalla de recorrido.
export function CategoryGrid({ categories }: { categories: CategoryItem[] }) {
  return (
    <motion.div
      variants={motionEnabled ? listVariants : undefined}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      data-testid="category-grid"
    >
      {categories.map((cat) => {
        const Icon = ICONS[cat.icon] ?? Package
        return (
          <motion.div key={cat.id} variants={motionEnabled ? cardVariants : undefined} whileHover="hover">
            <Link
              href={`/buscar?category=${cat.slug}`}
              data-testid="category-item"
              className="flex h-full min-h-16 items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-[var(--pad-cell)] transition-[border-color,box-shadow] duration-200 hover:border-[#BFDBFE] hover:shadow-[var(--shadow-card-hover)] sm:px-[var(--pad-card)]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-input)] bg-[var(--color-primary-soft)]">
                <Icon className="size-5 text-[var(--color-primary)]" />
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] font-semibold leading-tight text-[var(--color-navy)]">
                  {cat.name}
                </span>
                <span className="mt-0.5 block text-[12px] tabular-nums text-[var(--color-text-muted)]">
                  {cat._count.publications} activos
                </span>
              </span>
            </Link>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
