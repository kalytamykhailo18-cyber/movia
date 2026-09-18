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

  function buscar(termino?: string) {
    const valor = (termino ?? query).trim()
    router.push(valor ? `/buscar?q=${encodeURIComponent(valor)}` : '/buscar')
  }

  return (
    // El navy deja de ser una tarjeta redondeada flotando sobre gris y pasa a
    // ser el marco: la barra y el bloque de entrada son una sola masa navy de
    // borde a borde, y el catalogo sale de ella.
    <motion.section
      variants={motionEnabled ? sectionVariants : undefined}
      initial="hidden"
      animate="show"
      className="movia-sangrado relative -mt-6 overflow-hidden bg-[var(--color-navy)] px-4 py-12 md:px-6 md:py-16"
    >
      {/* El isotipo funciona como masa grafica, no como calcomania suelta.
          La prueba de identidad exige que se quede por debajo de 0.2. */}
      <img
        src="/brand/isotipo.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 w-[420px] select-none opacity-[0.07] md:-right-12 md:w-[560px]"
      />

      <div className="relative mx-auto w-full max-w-[1152px]">
        <div className="max-w-3xl">
          <p className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-label)] text-[var(--color-primary-bright)]">
            Marketplace de activos empresariales
          </p>

          <motion.h1
            initial={motionEnabled ? { opacity: 0, y: 14 } : undefined}
            animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 text-[32px] font-bold leading-[1.15] tracking-[var(--tracking-display)] text-white md:text-[40px]"
          >
            Lo que tu empresa no usa,{' '}
            <span className="text-[var(--color-primary-bright)]">muévelo</span>
          </motion.h1>

          <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-[var(--color-navy-muted)]">
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
            <div className="flex h-14 flex-1 items-center gap-3 rounded-[var(--radius-input)] bg-white px-4 transition-shadow focus-within:shadow-[0_0_0_3px_rgba(96,165,250,0.35)]">
              <Search className="size-5 shrink-0 text-[var(--color-text-muted)]" aria-hidden />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="¿Qué activo estás buscando?"
                aria-label="Buscar activos"
                data-testid="hero-search-input"
                // self-stretch y min-h: sin ellos el campo se queda en 20 px de
                // alto dentro del contenedor de 56 y no llega al minimo tactil.
                className="min-h-[44px] w-full min-w-0 self-stretch bg-transparent text-[16px] text-[var(--color-navy)] outline-none placeholder:text-[var(--color-text-muted)]"
              />
            </div>

            <motion.button
              type="submit"
              data-testid="hero-search-submit"
              whileHover={motionEnabled ? { scale: 1.015 } : undefined}
              whileTap={motionEnabled ? { scale: 0.98 } : undefined}
              className="inline-flex h-14 items-center justify-center gap-2 rounded-[var(--radius-input)] bg-[var(--color-primary)] px-8 text-[16px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)]"
            >
              Buscar
              <ArrowRight className="size-4" aria-hidden />
            </motion.button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="movia-etiqueta movia-etiqueta-navy mr-1">Populares</span>
            {SUGERENCIAS.map((s, i) => (
              <motion.button
                key={s}
                type="button"
                onClick={() => buscar(s)}
                initial={motionEnabled ? { opacity: 0, y: 6 } : undefined}
                animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.25, delay: 0.25 + i * 0.05 }}
                className="inline-flex min-h-[44px] items-center rounded-full border border-[var(--color-navy-line)] bg-white/5 px-4 text-[12px] font-medium text-[#E2E8F0] transition-colors hover:border-[var(--color-primary-bright)] hover:text-white"
              >
                {s}
              </motion.button>
            ))}
          </div>

          {/* Las cifras se leen como panel de instrumentos, no como texto. */}
          <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-4 border-t border-[var(--color-navy-line)] pt-6">
            <div>
              <dt className="movia-etiqueta movia-etiqueta-navy">Activos publicados</dt>
              <dd className="mt-2 text-[30px] font-bold leading-none tracking-[var(--tracking-tight)] tabular-nums text-white">
                {activos}
              </dd>
            </div>
            <div>
              <dt className="movia-etiqueta movia-etiqueta-navy">Empresas verificadas</dt>
              <dd className="mt-2 text-[30px] font-bold leading-none tracking-[var(--tracking-tight)] tabular-nums text-white">
                {empresas}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </motion.section>
  )
}
