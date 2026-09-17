'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ArrowRight } from 'lucide-react'
import { env } from '@/lib/env'
import { sectionVariants, motionEnabled } from '@/lib/motion'

const SUGERENCIAS = ['Torno CNC', 'Montacargas', 'Compresor', 'Retroexcavadora', 'Servidor']

export function HeroSearch({ activos, empresas }: { activos: number; empresas: number }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [enfocado, setEnfocado] = useState(false)

  function buscar(termino?: string) {
    const valor = (termino ?? query).trim()
    router.push(valor ? `/buscar?q=${encodeURIComponent(valor)}` : '/buscar')
  }

  return (
    <motion.section
      variants={motionEnabled ? sectionVariants : undefined}
      initial="hidden"
      animate="show"
      className="relative overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-navy)] px-6 py-14 md:px-12 md:py-20"
    >
      {/* El isotipo funciona como marca de agua: da identidad sin competir con el texto. */}
      <img
        src="/brand/isotipo.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 w-[380px] select-none opacity-[0.07] md:-right-10 md:w-[520px]"
      />

      <div className="relative max-w-3xl">
        <motion.p
          initial={motionEnabled ? { opacity: 0, y: 8 } : undefined}
          animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.3 }}
          className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#60A5FA]"
        >
          Marketplace de activos empresariales
        </motion.p>

        <motion.h1
          initial={motionEnabled ? { opacity: 0, y: 14 } : undefined}
          animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 text-[32px] font-bold leading-[1.1] tracking-tight text-white md:text-[40px]"
        >
          Lo que tu empresa no usa,{' '}
          <span className="relative whitespace-nowrap text-[#60A5FA]">
            muevelo
            <svg
              aria-hidden
              viewBox="0 0 200 12"
              preserveAspectRatio="none"
              className="absolute -bottom-1 left-0 h-2.5 w-full text-[var(--color-primary)]"
            >
              <path
                d="M2 9 C 50 3, 150 3, 198 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </motion.h1>

        <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/70">
          Maquinaria, equipos, inventarios y excedentes de empresas verificadas en{' '}
          {env.locale.countryName}. Publica lo que ya no rota y encuentra lo que necesitas.
        </p>

        <form
          className="mt-8 flex w-full max-w-2xl flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault()
            buscar()
          }}
        >
          <motion.div
            className="flex flex-1 items-center gap-2 rounded-[var(--radius-input)] bg-white px-4"
            animate={{
              boxShadow: enfocado
                ? '0 0 0 4px rgba(96, 165, 250, 0.35)'
                : '0 0 0 0 rgba(96, 165, 250, 0)',
            }}
            transition={{ duration: 0.15 }}
          >
            <Search className="size-5 shrink-0 text-[var(--color-text-muted)]" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setEnfocado(true)}
              onBlur={() => setEnfocado(false)}
              placeholder="Que activo estas buscando?"
              aria-label="Buscar activos"
              data-testid="hero-search-input"
              className="h-14 w-full bg-transparent text-[16px] text-[var(--color-navy)] outline-none placeholder:text-[var(--color-text-muted)]"
            />
          </motion.div>

          <motion.button
            type="submit"
            data-testid="hero-search-submit"
            whileHover={motionEnabled ? { scale: 1.015 } : undefined}
            whileTap={motionEnabled ? { scale: 0.98 } : undefined}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-[var(--radius-input)] bg-[var(--color-primary)] px-7 text-[16px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)]"
          >
            Buscar
            <ArrowRight className="size-4" aria-hidden />
          </motion.button>
        </form>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-[12px] text-white/50">Populares</span>
          {SUGERENCIAS.map((s, i) => (
            <motion.button
              key={s}
              type="button"
              onClick={() => buscar(s)}
              initial={motionEnabled ? { opacity: 0, y: 6 } : undefined}
              animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.25, delay: 0.25 + i * 0.05 }}
              whileHover={motionEnabled ? { y: -2 } : undefined}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[12px] text-white/80 transition-colors hover:border-[#60A5FA] hover:text-white"
            >
              {s}
            </motion.button>
          ))}
        </div>

        <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/10 pt-6">
          <div>
            <dt className="text-[12px] uppercase tracking-wider text-white/45">Activos publicados</dt>
            <dd className="mt-1 text-[26px] font-bold tabular-nums text-white">{activos}</dd>
          </div>
          <div>
            <dt className="text-[12px] uppercase tracking-wider text-white/45">Empresas verificadas</dt>
            <dd className="mt-1 text-[26px] font-bold tabular-nums text-white">{empresas}</dd>
          </div>
        </dl>
      </div>
    </motion.section>
  )
}
