'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Eye, MessageSquare, BadgeCheck, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { money, shortDate } from '@/lib/format'
import { cardVariants, motionEnabled } from '@/lib/motion'

export type PublicationCardData = {
  id: string
  slug: string
  title: string
  price: number
  currency: string
  condition: string | null
  cityName: string | null
  photo: string | null
  featured: boolean
  publishedAt: string
  viewCount: number
  leadCount: number
  companyName: string | null
  companyVerified: boolean
}

export function PublicationCard({
  item,
  index = 0,
  className,
}: {
  item: PublicationCardData
  index?: number
  className?: string
}) {
  return (
    <motion.article
      variants={motionEnabled ? cardVariants : undefined}
      initial="hidden"
      animate="show"
      whileHover="hover"
      whileTap="tap"
      custom={index}
      className={cn(
        'group relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)]',
        'bg-white shadow-[var(--shadow-card)] transition-[box-shadow,border-color] duration-200',
        'hover:border-[#BFDBFE] hover:shadow-[var(--shadow-card-hover)]',
        className,
      )}
      data-testid="publication-card"
    >
      <Link href={`/publicacion/${item.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-background)]">
          {item.photo ? (
            <motion.img
              src={item.photo}
              alt={item.title}
              className="size-full object-cover"
              initial={{ scale: 1 }}
              whileHover={motionEnabled ? { scale: 1.03 } : undefined}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          ) : (
            <div className="flex size-full items-center justify-center text-[12px] text-[var(--color-text-muted)]">
              Sin fotografia
            </div>
          )}

          {item.featured ? (
            <span
              className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-[var(--color-navy)] px-2.5 py-1 text-[11px] font-medium text-white"
              data-testid="featured-badge"
            >
              <Star className="size-3" aria-hidden />
              Destacado
            </span>
          ) : null}
        </div>

        <div className="p-4">
          <h3 className="line-clamp-2 min-h-[2.6em] text-[18px] font-semibold leading-snug text-[var(--color-navy)]">
            {item.title}
          </h3>

          <p
            className="mt-2 text-[22px] font-bold leading-none tracking-tight text-[var(--color-navy)]"
            data-testid="card-price"
          >
            {money(item.price, item.currency)}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[var(--color-text-muted)]">
            {item.cityName ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" aria-hidden />
                {item.cityName}
              </span>
            ) : null}
            {item.condition ? (
              <>
                <span aria-hidden className="text-[var(--color-border)]">&middot;</span>
                <span>{item.condition}</span>
              </>
            ) : null}
          </div>
        </div>

        {/* Franja del vendedor: separa quien publica del activo en si. */}
        <div
          className="flex items-center justify-between gap-2 border-t border-[var(--color-border)] bg-[var(--color-background)] px-4 py-2.5"
          data-testid="card-seller"
        >
          <span className="inline-flex min-w-0 items-center gap-1.5 text-[12px] font-medium text-[var(--color-navy)]">
            {item.companyVerified ? (
              <BadgeCheck className="size-3.5 shrink-0 text-[var(--color-primary)]" aria-hidden />
            ) : null}
            <span className="truncate">{item.companyName ?? 'Persona natural'}</span>
          </span>

          <span className="flex shrink-0 items-center gap-2.5 text-[11px] tabular-nums text-[var(--color-text-muted)]">
            <span className="inline-flex items-center gap-1" title="Visualizaciones">
              <Eye className="size-3.5" aria-hidden />
              {item.viewCount}
            </span>
            <span className="inline-flex items-center gap-1" title="Contactos">
              <MessageSquare className="size-3.5" aria-hidden />
              {item.leadCount}
            </span>
          </span>
        </div>
      </Link>
    </motion.article>
  )
}
