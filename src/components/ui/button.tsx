'use client'

import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants, motionEnabled } from '@/lib/motion'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]',
  secondary:
    'bg-white text-[var(--color-navy)] border border-[#D1D5DB] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]',
  danger: 'bg-[var(--color-danger)] text-white hover:brightness-95',
  ghost: 'bg-transparent text-[var(--color-navy)] hover:bg-[var(--color-primary-soft)]',
}

const SIZE_CLASS: Record<Size, string> = {
  sm: 'h-9 px-3 text-[14px] gap-1.5',
  md: 'h-11 px-4 text-[14px] gap-2',
  lg: 'h-12 px-6 text-[16px] gap-2',
}

export type ButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  variant?: Variant
  size?: Size
  loading?: boolean
  children?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className, children, ...props },
  ref,
) {
  const isDisabled = disabled || loading

  return (
    <motion.button
      ref={ref}
      type="button"
      disabled={isDisabled}
      variants={motionEnabled ? buttonVariants : undefined}
      initial="rest"
      whileHover={isDisabled ? undefined : 'hover'}
      whileTap={isDisabled ? undefined : 'tap'}
      animate={isDisabled ? 'disabled' : 'rest'}
      className={cn(
        'inline-flex items-center justify-center rounded-[var(--radius-input)] font-medium',
        'transition-colors duration-150 disabled:cursor-not-allowed select-none',
        'min-h-[44px]',
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </motion.button>
  )
})
