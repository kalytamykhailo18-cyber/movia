'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { env } from '@/lib/env'

const TRICKLE_CEILING = 90

export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [value, setValue] = useState(0)
  const [visible, setVisible] = useState(false)

  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const route = `${pathname}?${searchParams.toString()}`
  const firstRender = useRef(true)

  function stopTrickle() {
    if (timer.current) {
      clearInterval(timer.current)
      timer.current = null
    }
  }

  useEffect(() => {
    function start() {
      if (hideTimer.current) clearTimeout(hideTimer.current)
      stopTrickle()

      setVisible(true)
      setValue(12)

      // Avanza rapido al principio y se frena cerca del final: el usuario ve
      // progreso sin que la barra prometa que ya termino.
      timer.current = setInterval(() => {
        setValue((current) => {
          if (current >= TRICKLE_CEILING) return current
          const remaining = TRICKLE_CEILING - current
          return current + Math.max(0.6, remaining * 0.08)
        })
      }, 120)
    }

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const anchor = (event.target as HTMLElement | null)?.closest?.('a')
      if (!anchor) return
      if (anchor.target && anchor.target !== '_self') return
      if (anchor.hasAttribute('download')) return

      const href = anchor.getAttribute('href')
      if (!href || !href.startsWith('/')) return

      const current = `${window.location.pathname}${window.location.search}`
      if (href === current) return

      start()
    }

    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      stopTrickle()
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [])

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }

    stopTrickle()
    setValue(100)

    hideTimer.current = setTimeout(() => {
      setVisible(false)
      setValue(0)
    }, 260)
  }, [route])

  if (!visible) return null

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-0.5 overflow-hidden"
      role="progressbar"
      aria-label="Cargando pagina"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(value)}
      data-testid="navigation-progress"
      data-value={Math.round(value)}
    >
      <div
        className="h-full rounded-r-full bg-[var(--color-primary)]"
        style={{
          width: `${value}%`,
          transition: `width ${env.ui.durationBase}s cubic-bezier(0.16, 1, 0.3, 1), opacity ${env.ui.durationFast}s linear`,
          opacity: value >= 100 ? 0 : 1,
        }}
      />
    </div>
  )
}
