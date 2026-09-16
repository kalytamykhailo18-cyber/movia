'use client'

import { motion } from 'framer-motion'
import { sectionVariants, motionEnabled } from '@/lib/motion'

export function AnimatedSection({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.section
      variants={motionEnabled ? sectionVariants : undefined}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      className={className}
    >
      {children}
    </motion.section>
  )
}
