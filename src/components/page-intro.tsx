'use client'

import { motion } from 'framer-motion'
import { pageVariants, motionEnabled } from '@/lib/motion'

export function PageIntro({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={motionEnabled ? pageVariants : undefined}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  )
}
