'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'
import { counterVariants, motionEnabled } from '@/lib/motion'
import { env } from '@/lib/env'

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(motionEnabled ? 0 : target)

  useEffect(() => {
    if (!active || !motionEnabled) {
      setValue(target)
      return
    }

    const duration = env.ui.durationSlow * 1000 * 2
    const start = performance.now()
    let frame = 0

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, active])

  return value
}

export function StatCard({
  label,
  value,
  icon,
  hint,
  tone = 'default',
  testId,
}: {
  label: string
  value: number
  icon: React.ReactNode
  hint?: string
  tone?: 'default' | 'primary' | 'success' | 'accent'
  testId?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const animated = useCountUp(value, inView)

  const toneClass = {
    default: 'text-[var(--color-navy)]',
    primary: 'text-[var(--color-primary)]',
    success: 'text-[var(--color-success)]',
    accent: 'text-[var(--color-accent)]',
  }[tone]

  return (
    <motion.div
      ref={ref}
      variants={motionEnabled ? counterVariants : undefined}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4"
      data-testid={testId}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] text-[var(--color-text-muted)]">{label}</span>
        <span className={cn('shrink-0', toneClass)}>{icon}</span>
      </div>

      <p className={cn('mt-2 text-[28px] font-bold tabular-nums', toneClass)} data-testid={testId ? `${testId}-value` : undefined}>
        {animated.toLocaleString(env.locale.locale)}
      </p>

      {hint ? <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">{hint}</p> : null}
    </motion.div>
  )
}
