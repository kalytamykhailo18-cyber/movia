'use client'

import { useEffect } from 'react'

export function ServiceWorker({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => null)
  }, [enabled])

  return null
}
