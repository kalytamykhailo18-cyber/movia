'use client'

import { motion } from 'framer-motion'
import { listVariants, cardVariants, motionEnabled } from '@/lib/motion'
import { Children } from 'react'

export function StaggerGrid({
  children,
  className,
  testId,
}: {
  children: React.ReactNode
  className?: string
  testId?: string
}) {
  return (
    <motion.div
      variants={motionEnabled ? listVariants : undefined}
      initial="hidden"
      animate="show"
      className={className}
      data-testid={testId}
    >
      {Children.map(children, (child, i) => (
        <motion.div key={i} variants={motionEnabled ? cardVariants : undefined}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
