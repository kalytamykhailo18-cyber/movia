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

export function CategoryGrid({ categories }: { categories: CategoryItem[] }) {
  return (
    <motion.div
      variants={motionEnabled ? listVariants : undefined}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8"
      data-testid="category-grid"
    >
      {categories.map((cat) => {
        const Icon = ICONS[cat.icon] ?? Package
        return (
          <motion.div key={cat.id} variants={motionEnabled ? cardVariants : undefined} whileHover="hover">
            <Link
              href={`/buscar?category=${cat.slug}`}
              data-testid="category-item"
              className="flex h-full flex-col items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4 text-center shadow-[var(--shadow-card)] transition-colors hover:border-[var(--color-primary)]"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-[var(--color-primary-soft)]">
                <Icon className="size-5 text-[var(--color-primary)]" />
              </span>
              <span className="text-[13px] font-medium leading-tight text-[var(--color-navy)]">{cat.name}</span>
              <span className="text-[11px] text-[var(--color-text-muted)]">{cat._count.publications}</span>
            </Link>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
