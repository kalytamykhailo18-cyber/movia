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
      <div className="movia-plano flex aspect-[4/3] items-center justify-center rounded-[var(--radius-card)] border border-[var(--color-border)]">
        <span className="movia-etiqueta text-[#7f9fd0]">Sin fotografias</span>
      </div>
    )
  }

  return (
    <>
      <section className="space-y-3" data-testid="gallery">
        {/* El marco se apoya en el mismo plano que la tarjeta, asi el
            marcador generado, que llega transparente, cae sobre la retícula y
            no sobre un blanco suelto. */}
        <div className="movia-plano relative overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)]">
          <div className="relative z-0 aspect-[4/3] w-full">
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

          {/* La misma chapa remachada de la tarjeta, en la misma esquina: la
              galeria y el catalogo hablan el mismo idioma. */}
          <span
            className="pointer-events-none absolute bottom-0 left-0 z-20 inline-flex h-[26px] items-center rounded-tr-[var(--radius-input)] bg-[var(--color-navy)] px-3 text-[length:var(--text-label)] font-semibold uppercase tracking-[0.1em] tabular-nums text-white"
            data-testid="gallery-counter"
          >
            {index + 1} / {total}
          </span>

          <button
            type="button"
            onClick={() => setZoom(true)}
            aria-label="Ampliar imagen"
            data-testid="gallery-expand"
            className="absolute right-3 top-3 z-20 inline-flex size-11 items-center justify-center rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white/95 text-[var(--color-navy)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
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
                  // 4:3 como el marco: una miniatura cuadrada recorta un
                  // encuadre distinto del que se va a abrir.
                  'movia-plano relative h-14 w-[74px] shrink-0 overflow-hidden rounded-[var(--radius-input)] border-2 transition-[border-color,opacity]',
                  i === index
                    ? 'border-[var(--color-primary)] opacity-100'
                    : 'border-[var(--color-border)] opacity-60 hover:opacity-100',
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

            <span className="absolute bottom-6 rounded-[var(--radius-input)] bg-white/10 px-3 py-1.5 text-[length:var(--text-label)] font-semibold uppercase tracking-[0.1em] tabular-nums text-white">
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
    <div
      className={cn(
        'absolute top-1/2 z-20 -translate-y-1/2',
        side === 'left' ? 'left-3' : 'right-3',
      )}
    >
      <motion.button
        type="button"
        onClick={onClick}
        aria-label={label}
        data-testid={testId}
        whileHover={motionEnabled ? { scale: 1.06 } : undefined}
        whileTap={motionEnabled ? { scale: 0.94 } : undefined}
        className="inline-flex size-11 items-center justify-center rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white/95 text-[var(--color-navy)] shadow-[var(--shadow-card)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
      >
        <Icon className="size-5" aria-hidden />
      </motion.button>
    </div>
  )
}
