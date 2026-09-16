'use client'

import { motion } from 'framer-motion'
import { BadgeCheck, Clock, XCircle, Star, Zap, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { badgeVariants, motionEnabled } from '@/lib/motion'

type Tone = 'verified' | 'pending' | 'rejected' | 'featured' | 'neutral' | 'success' | 'danger'

const TONE: Record<Tone, string> = {
  verified: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
  pending: 'bg-amber-50 text-amber-700',
  rejected: 'bg-red-50 text-[var(--color-danger)]',
  featured: 'bg-[var(--color-navy)] text-white',
  neutral: 'bg-slate-100 text-[var(--color-text-muted)]',
  success: 'bg-green-50 text-[var(--color-success)]',
  danger: 'bg-red-50 text-[var(--color-danger)]',
}

export function Badge({
  tone = 'neutral',
  icon,
  children,
  className,
}: {
  tone?: Tone
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.span
      variants={motionEnabled ? badgeVariants : undefined}
      initial="hidden"
      animate="show"
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-medium',
        TONE[tone],
        className,
      )}
    >
      {icon}
      {children}
    </motion.span>
  )
}

export function VerifiedBadge({ status }: { status: string }) {
  if (status === 'approved') {
    return (
      <Badge tone="verified" icon={<BadgeCheck className="size-3.5" aria-hidden />}>
        Empresa verificada
      </Badge>
    )
  }
  if (status === 'pending') {
    return (
      <Badge tone="pending" icon={<Clock className="size-3.5" aria-hidden />}>
        Verificacion pendiente
      </Badge>
    )
  }
  if (status === 'rejected') {
    return (
      <Badge tone="rejected" icon={<XCircle className="size-3.5" aria-hidden />}>
        No verificada
      </Badge>
    )
  }
  return (
    <Badge tone="neutral" icon={<Clock className="size-3.5" aria-hidden />}>
      Requiere revision
    </Badge>
  )
}

const COMPANY_BADGE: Record<string, { label: string; icon: React.ReactNode }> = {
  verified: { label: 'Verificada', icon: <BadgeCheck className="size-3.5" aria-hidden /> },
  top_seller: { label: 'Top seller', icon: <Star className="size-3.5" aria-hidden /> },
  fast_response: { label: 'Respuesta rapida', icon: <Zap className="size-3.5" aria-hidden /> },
  veteran: { label: 'Anos en MOVIA', icon: <Calendar className="size-3.5" aria-hidden /> },
}

export function CompanyBadges({ badges }: { badges: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((key) => {
        const def = COMPANY_BADGE[key]
        if (!def) return null
        return (
          <Badge key={key} tone="neutral" icon={def.icon}>
            {def.label}
          </Badge>
        )
      })}
    </div>
  )
}
