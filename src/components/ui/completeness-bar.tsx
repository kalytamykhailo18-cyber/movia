'use client'

import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { progressVariants, motionEnabled } from '@/lib/motion'

export function CompletenessBar({
  score,
  hint,
  compact = false,
  className,
}: {
  score: number
  hint?: string | null
  compact?: boolean
  className?: string
}) {
  const tone =
    score >= 90
      ? 'var(--color-success)'
      : score >= 60
        ? 'var(--color-primary)'
        : 'var(--color-danger)'

  return (
    <div className={cn('w-full', className)} data-testid="completeness">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-semibold text-[var(--color-navy)]">
          Publicacion {score}% completa
        </span>
        {!compact && score < 100 ? (
          <span className="text-[12px] text-[var(--color-text-muted)]">Meta 100%</span>
        ) : null}
      </div>

      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white">
        <motion.div
          className="h-full origin-left rounded-full"
          style={{ background: tone }}
          variants={motionEnabled ? progressVariants : undefined}
          initial="hidden"
          animate="show"
          custom={score}
          data-testid="completeness-fill"
        />
      </div>

      {hint && !compact ? (
        <p className="mt-2 flex items-start gap-1.5 text-[12px] text-[var(--color-text-muted)]">
          <Info className="mt-0.5 size-4 shrink-0 text-[var(--color-primary)]" aria-hidden />
          {hint}
        </p>
      ) : null}
    </div>
  )
}
