'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, Tag, BadgeCheck, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { tabIndicatorTransition, motionEnabled } from '@/lib/motion'

const ITEMS = [
  { href: '/admin', label: 'Resumen', icon: LayoutDashboard },
  { href: '/admin/planes', label: 'Planes y tarifas', icon: Tag },
  { href: '/admin/verificaciones', label: 'Verificaciones', icon: BadgeCheck },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="min-w-0 lg:sticky lg:top-24 lg:self-start" aria-label="Administracion">
      <ul className="movia-scrollbar flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                data-testid={`admin-nav-${item.href.split('/').pop()}`}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-[var(--radius-input)] px-3 text-[14px] font-medium transition-colors lg:w-full',
                  active
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-navy)] hover:bg-white',
                )}
              >
                {active && motionEnabled ? (
                  <motion.span
                    layoutId="admin-active"
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
