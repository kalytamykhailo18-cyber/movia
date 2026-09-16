import type { Variants, Transition } from 'framer-motion'
import { env } from './env'

const FAST = env.ui.durationFast
const BASE = env.ui.durationBase
const SLOW = env.ui.durationSlow
const STAGGER = env.ui.stagger

const EASE_OUT: Transition['ease'] = [0.16, 1, 0.3, 1]
const EASE_IN_OUT: Transition['ease'] = [0.4, 0, 0.2, 1]

export const motionEnabled = env.ui.animationEnabled

export const pageVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: BASE, ease: EASE_OUT, when: 'beforeChildren', staggerChildren: STAGGER },
  },
  exit: { opacity: 0, y: -8, transition: { duration: FAST, ease: EASE_IN_OUT } },
}

export const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: SLOW, ease: EASE_OUT, staggerChildren: STAGGER },
  },
}

export const listVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: STAGGER, delayChildren: FAST } },
}

export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: BASE, ease: EASE_OUT } },
  hover: { y: -4, transition: { duration: FAST, ease: EASE_OUT } },
  tap: { scale: 0.99, transition: { duration: FAST } },
}

export const buttonVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.015, transition: { duration: FAST, ease: EASE_OUT } },
  tap: { scale: 0.975, transition: { duration: FAST } },
  disabled: { opacity: 0.5, scale: 1 },
}

export const fieldVariants: Variants = {
  rest: { borderColor: 'var(--color-border)' },
  focus: { borderColor: 'var(--color-primary)', transition: { duration: FAST, ease: EASE_OUT } },
  error: { borderColor: 'var(--color-danger)', transition: { duration: FAST } },
}

export const modalOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: FAST, ease: EASE_IN_OUT } },
  exit: { opacity: 0, transition: { duration: FAST, ease: EASE_IN_OUT } },
}

export const modalPanelVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 8 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: BASE, ease: EASE_OUT } },
  exit: { opacity: 0, scale: 0.97, y: 8, transition: { duration: FAST, ease: EASE_IN_OUT } },
}

export const drawerVariants: Variants = {
  hidden: { x: '-100%' },
  show: { x: 0, transition: { duration: BASE, ease: EASE_OUT } },
  exit: { x: '-100%', transition: { duration: FAST, ease: EASE_IN_OUT } },
}

export const badgeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: { duration: BASE, ease: EASE_OUT } },
}

export const galleryVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0, transition: { duration: BASE, ease: EASE_OUT } },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -40 : 40,
    transition: { duration: FAST, ease: EASE_IN_OUT },
  }),
}

export const progressVariants: Variants = {
  hidden: { scaleX: 0 },
  show: (value: number) => ({
    scaleX: value / 100,
    transition: { duration: SLOW, ease: EASE_OUT },
  }),
}

export const counterVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: BASE, ease: EASE_OUT } },
}

export const toastVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: BASE, ease: EASE_OUT } },
  exit: { opacity: 0, y: 12, scale: 0.97, transition: { duration: FAST, ease: EASE_IN_OUT } },
}

export const skeletonVariants: Variants = {
  pulse: {
    opacity: [0.5, 1, 0.5],
    transition: { duration: 1.4, repeat: Infinity, ease: EASE_IN_OUT },
  },
}

export const accordionVariants: Variants = {
  collapsed: { height: 0, opacity: 0, transition: { duration: FAST, ease: EASE_IN_OUT } },
  expanded: { height: 'auto', opacity: 1, transition: { duration: BASE, ease: EASE_OUT } },
}

export const tabIndicatorTransition: Transition = { duration: BASE, ease: EASE_OUT }
