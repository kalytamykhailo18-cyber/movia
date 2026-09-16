'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { galleryVariants, modalOverlayVariants, modalPanelVariants, motionEnabled } from '@/lib/motion'

export function Gallery({ photos, title }: { photos: string[]; title: string }) {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [zoom, setZoom] = useState(false)

  const total = photos.length

  const go = useCallback(
    (next: number) => {
      if (!total) return
      const target = (next + total) % total
      setDirection(next > index ? 1 : -1)
      setIndex(target)
    },
    [index, total],
  )

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') go(index + 1)
      if (e.key === 'ArrowLeft') go(index - 1)
      if (e.key === 'Escape') setZoom(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, index])

  if (!total) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white text-[14px] text-[var(--color-text-muted)]">
        Sin fotografias
      </div>
    )
  }

  return (
    <>
      <section className="space-y-3" data-testid="gallery">
        <div className="relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white">
          <div className="relative aspect-[4/3] w-full">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.img
                key={index}
                src={photos[index]}
                alt={`${title} - imagen ${index + 1} de ${total}`}
                custom={direction}
                variants={motionEnabled ? galleryVariants : undefined}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 size-full object-cover"
                data-testid="gallery-main"
              />
            </AnimatePresence>
          </div>

          <span
            className="absolute bottom-3 right-3 rounded-full bg-[var(--color-navy)]/80 px-2.5 py-1 text-[12px] font-medium text-white"
            data-testid="gallery-counter"
          >
            {index + 1} / {total}
          </span>

          <button
            type="button"
            onClick={() => setZoom(true)}
            aria-label="Ampliar imagen"
            data-testid="gallery-expand"
            className="absolute right-3 top-3 inline-flex size-11 items-center justify-center rounded-full bg-white/90 text-[var(--color-navy)] transition-colors hover:bg-white"
          >
            <Expand className="size-4" aria-hidden />
          </button>

          {total > 1 ? (
            <>
              <NavButton side="left" onClick={() => go(index - 1)} label="Imagen anterior" testId="gallery-prev" />
              <NavButton side="right" onClick={() => go(index + 1)} label="Imagen siguiente" testId="gallery-next" />
            </>
          ) : null}
        </div>

        {total > 1 ? (
          <div className="movia-scrollbar flex gap-2 overflow-x-auto pb-1" data-testid="gallery-thumbs">
            {photos.map((photo, i) => (
              <motion.button
                key={photo}
                type="button"
                onClick={() => go(i)}
                aria-label={`Ver imagen ${i + 1}`}
                aria-current={i === index}
                whileHover={motionEnabled ? { y: -2 } : undefined}
                className={cn(
                  'relative size-16 shrink-0 overflow-hidden rounded-[var(--radius-input)] border-2 transition-colors',
                  i === index ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)]',
                )}
              >
                <img src={photo} alt="" className="size-full object-cover" />
              </motion.button>
            ))}
          </div>
        ) : null}
      </section>

      <AnimatePresence>
        {zoom ? (
          <motion.div
            variants={modalOverlayVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-navy)]/90 p-4"
            onClick={() => setZoom(false)}
            data-testid="gallery-lightbox"
          >
            <button
              type="button"
              onClick={() => setZoom(false)}
              aria-label="Cerrar"
              className="absolute right-4 top-4 inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white"
            >
              <X className="size-5" aria-hidden />
            </button>

            <motion.img
              key={index}
              src={photos[index]}
              alt={`${title} - imagen ${index + 1}`}
              variants={motionEnabled ? modalPanelVariants : undefined}
              initial="hidden"
              animate="show"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-full rounded-[var(--radius-modal)] object-contain"
            />

            <span className="absolute bottom-6 rounded-full bg-white/10 px-3 py-1 text-[13px] text-white">
              {index + 1} / {total}
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}

function NavButton({
  side,
  onClick,
  label,
  testId,
}: {
  side: 'left' | 'right'
  onClick: () => void
  label: string
  testId: string
}) {
  const Icon = side === 'left' ? ChevronLeft : ChevronRight
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      data-testid={testId}
      whileHover={motionEnabled ? { scale: 1.06 } : undefined}
      whileTap={motionEnabled ? { scale: 0.94 } : undefined}
      className={cn(
        'absolute top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[var(--color-navy)] shadow-sm transition-colors hover:bg-white',
        side === 'left' ? 'left-3' : 'right-3',
      )}
    >
      <Icon className="size-5" aria-hidden />
    </motion.button>
  )
}
