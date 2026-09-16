'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { sectionVariants, motionEnabled } from '@/lib/motion'

const SUGGESTIONS = ['Torno CNC', 'Montacargas', 'Compresor', 'Retroexcavadora', 'Servidor']

export function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)

  function submit(term?: string) {
    const value = (term ?? query).trim()
    router.push(value ? `/buscar?q=${encodeURIComponent(value)}` : '/buscar')
  }

  return (
    <motion.section
      variants={motionEnabled ? sectionVariants : undefined}
      initial="hidden"
      animate="show"
      className="rounded-[var(--radius-card)] bg-white px-6 py-10 text-center shadow-[var(--shadow-card)] md:px-12 md:py-14"
    >
      <motion.h1
        className="mx-auto max-w-2xl text-[32px] font-bold leading-tight text-[var(--color-navy)] md:text-[40px]"
        initial={motionEnabled ? { opacity: 0, y: 12 } : undefined}
        animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        Que activo estas buscando?
      </motion.h1>

      <p className="mx-auto mt-3 max-w-xl text-[16px] text-[var(--color-text-muted)]">
        Maquinaria, equipos, inventarios y excedentes de empresas verificadas.
      </p>

      <form
        className="mx-auto mt-8 flex w-full max-w-2xl flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <motion.div
          className="flex flex-1 items-center gap-2 rounded-[var(--radius-input)] border bg-white px-3"
          animate={{
            borderColor: focused ? 'var(--color-primary)' : 'var(--color-border)',
            boxShadow: focused ? '0 0 0 3px rgba(37, 99, 235, 0.12)' : '0 0 0 0 rgba(0,0,0,0)',
          }}
          transition={{ duration: 0.15 }}
        >
          <Search className="size-5 shrink-0 text-[var(--color-text-muted)]" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Torno CNC, montacargas, compresor..."
            aria-label="Buscar activos"
            data-testid="hero-search-input"
            className="h-12 w-full bg-transparent text-[16px] text-[var(--color-navy)] outline-none placeholder:text-[var(--color-text-muted)]"
          />
        </motion.div>

        <Button type="submit" size="lg" data-testid="hero-search-submit">
          Buscar
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className="text-[12px] text-[var(--color-text-muted)]">Populares:</span>
        {SUGGESTIONS.map((s, i) => (
          <motion.button
            key={s}
            type="button"
            onClick={() => submit(s)}
            initial={motionEnabled ? { opacity: 0, y: 6 } : undefined}
            animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.25, delay: 0.3 + i * 0.05 }}
            whileHover={motionEnabled ? { y: -2 } : undefined}
            className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[12px] text-[var(--color-navy)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            {s}
          </motion.button>
        ))}
      </div>
    </motion.section>
  )
}
