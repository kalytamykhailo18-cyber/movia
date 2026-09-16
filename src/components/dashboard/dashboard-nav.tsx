'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { LayoutDashboard, FileText, Inbox, Receipt } from 'lucide-react'
import { cn } from '@/lib/utils'
import { tabIndicatorTransition, motionEnabled } from '@/lib/motion'

const ITEMS = [
  { href: '/mi-empresa', label: 'Resumen', icon: LayoutDashboard },
  { href: '/mi-empresa/publicaciones', label: 'Mis publicaciones', icon: FileText },
  { href: '/mi-empresa/contactos', label: 'Contactos recibidos', icon: Inbox },
  { href: '/mi-empresa/facturacion', label: 'Suscripcion y facturacion', icon: Receipt },
]

export function DashboardNav() {
  const pathname = usePathname()
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const list = listRef.current
    const active = list?.querySelector<HTMLAnchorElement>('[data-active="true"]')
    if (!list || !active || list.scrollWidth <= list.clientWidth) return

    const target = active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2
    list.scrollTo({ left: Math.max(0, target), behavior: 'auto' })
  }, [pathname])

  return (
    <nav className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start" aria-label="Mi Empresa">
      <ul
        ref={listRef}
        className="movia-scrollbar flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible"
      >
        {ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <li key={item.href} className="relative shrink-0">
              <Link
                href={item.href}
                data-testid={`nav-${item.href.split('/').pop()}`}
                data-active={active ? 'true' : 'false'}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-[var(--radius-input)] px-3 text-[14px] font-medium transition-colors lg:w-full',
                  active
                    ? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'
                    : 'text-[var(--color-navy)] hover:bg-white',
                )}
              >
                {active && motionEnabled ? (
                  <motion.span
                    layoutId="dashboard-active"
                    transition={tabIndicatorTransition}
                    className="pointer-events-none absolute inset-0 rounded-[var(--radius-input)] bg-[var(--color-primary-soft)]"
                  />
                ) : null}
                <item.icon className="relative size-4" aria-hidden />
                <span className="relative">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
