'use client'

import { useEffect } from 'react'

function sessionId(): string {
  const KEY = 'movia_session_id'
  try {
    const existing = sessionStorage.getItem(KEY)
    if (existing) return existing
    const created = Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem(KEY, created)
    return created
  } catch {
    return 'anonymous'
  }
}

export function ViewTracker({ publicationId }: { publicationId: string }) {
  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicationId, type: 'view', sessionId: sessionId() }),
      signal: controller.signal,
    }).catch(() => null)

    return () => controller.abort()
  }, [publicationId])

  return null
}
