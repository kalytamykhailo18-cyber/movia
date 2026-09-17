'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Heart, MessageSquare, Building2, Plus, Menu, X, LayoutGrid, LogOut, Shield, UserRound } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { SessionUser } from '@/lib/auth'
import { Suspense } from 'react'
import { NavigationProgress } from '@/components/navigation-progress'
import { cn } from '@/lib/utils'
import { drawerVariants, modalOverlayVariants, tabIndicatorTransition, motionEnabled } from '@/lib/motion'

const NAV = [
  { href: '/buscar', label: 'Buscar', icon: Search },
  { href: '/categorias', label: 'Categorias', icon: LayoutGrid },
  { href: '/favoritos', label: 'Favoritos', icon: Heart },
  { href: '/mensajes', label: 'Mensajes', icon: MessageSquare },
  { href: '/mi-empresa', label: 'Mi Empresa', icon: Building2 },
]

export function SiteHeader({ user }: { user: SessionUser | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white">
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>

      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-4 px-4 md:px-6">
        <Link href="/" className="flex min-h-[44px] shrink-0 items-center" aria-label="MOVIA inicio">
          <img src="/brand/logo-web.png" alt="MOVIA" width={115} height={80} className="h-9 w-auto" />
        </Link>

        <nav className="hidden items-center gap-1 xl:flex" aria-label="Principal">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={`nav-${item.href.replace('/', '')}`}
                className={cn(
                  'relative flex h-16 items-center whitespace-nowrap px-2.5 text-[14px] font-medium transition-colors',
                  active
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-navy)] hover:text-[var(--color-primary)]',
                )}
              >
                {item.label}
                {active && motionEnabled ? (
                  <motion.span
                    layoutId="nav-indicator"
                    transition={tabIndicatorTransition}
                    className="pointer-events-none absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[var(--color-primary)]"
                  />
                ) : null}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            href="/publicar"
            data-testid="nav-publish"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[var(--radius-input)] bg-[var(--color-primary)] px-4 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)]"
          >
            <Plus className="size-4" aria-hidden />
            Publicar
          </Link>

          {user ? (
            <div className="hidden items-center gap-2 xl:flex">
              {user.role === 'admin' ? (
                <Link
                  href="/admin"
                  data-testid="nav-admin"
                  title="Administracion"
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-[var(--radius-input)] border border-[#D1D5DB] px-3 text-[14px] font-medium text-[var(--color-navy)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                >
                  <Shield className="size-4" aria-hidden />
                  Admin
                </Link>
              ) : null}

              <span
                className="hidden min-h-[44px] items-center gap-1.5 whitespace-nowrap px-2 text-[14px] text-[var(--color-navy)] 2xl:inline-flex"
                data-testid="session-user"
              >
                <UserRound className="size-4" aria-hidden />
                {user.fullName.split(' ')[0]}
              </span>

              <button
                type="button"
                onClick={logout}
                data-testid="logout"
                aria-label="Cerrar sesion"
                className="inline-flex size-11 items-center justify-center rounded-[var(--radius-input)] text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-danger)]"
              >
                <LogOut className="size-4" aria-hidden />
              </button>
            </div>
          ) : (
            <Link
              href="/ingresar"
              data-testid="nav-login"
              className="hidden min-h-[44px] items-center whitespace-nowrap rounded-[var(--radius-input)] border border-[#D1D5DB] px-4 text-[14px] font-medium text-[var(--color-navy)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] xl:inline-flex"
            >
              Ingresar
            </Link>
          )}

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            className="inline-flex size-11 items-center justify-center rounded-[var(--radius-input)] border border-[var(--color-border)] xl:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              variants={modalOverlayVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-[var(--color-navy)]/40 xl:hidden"
            />
            <motion.aside
              variants={drawerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-[var(--color-border)] bg-white p-4 xl:hidden"
              data-testid="mobile-menu"
            >
              <div className="mb-4 flex items-center justify-between">
                <img src="/brand/logo-web.png" alt="MOVIA" width={115} height={80} className="h-8 w-auto" />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar menu"
                  className="inline-flex size-11 items-center justify-center rounded-[var(--radius-input)]"
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-input)] px-3 text-[14px] font-medium text-[var(--color-navy)] hover:bg-[var(--color-primary-soft)]"
                  >
                    <item.icon className="size-4" aria-hidden />
                    {item.label}
                  </Link>
                ))}

                {user?.role === 'admin' ? (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-input)] px-3 text-[14px] font-medium text-[var(--color-navy)] hover:bg-[var(--color-primary-soft)]"
                  >
                    <Shield className="size-4" aria-hidden />
                    Admin
                  </Link>
                ) : null}

                {user ? (
                  <button
                    type="button"
                    data-testid="logout-mobile"
                    onClick={() => {
                      setOpen(false)
                      logout()
                    }}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-input)] px-3 text-left text-[14px] font-medium text-[var(--color-danger)]"
                  >
                    <LogOut className="size-4" aria-hidden />
                    Cerrar sesion
                  </button>
                ) : (
                  <Link
                    href="/ingresar"
                    onClick={() => setOpen(false)}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-input)] px-3 text-[14px] font-medium text-[var(--color-primary)]"
                  >
                    <UserRound className="size-4" aria-hidden />
                    Ingresar
                  </Link>
                )}
              </nav>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
