'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ArrowRight, ChevronDown } from 'lucide-react'
import { env } from '@/lib/env'
import { money } from '@/lib/format'
import { sectionVariants, motionEnabled } from '@/lib/motion'
import type { PublicationCardData } from '@/components/publication-card'

const SUGERENCIAS = ['Torno CNC', 'Montacargas', 'Compresor', 'Retroexcavadora', 'Servidor']

// El comprador llega sabiendo el modelo que necesita, y nadie busca "torno" a
// secas: busca un torno de cierta potencia, en cierta ciudad, de cierto ano.
// Los cuatro desplegables apuntan a parametros que /buscar ya entiende, asi
// que filtran de verdad y no son adorno.
const ANOS = [2010, 2015, 2018, 2020, 2022]

type Opcion = { valor: string; texto: string }

function Filtro({
  etiqueta,
  nombre,
  valor,
  onChange,
  porDefecto,
  opciones,
}: {
  etiqueta: string
  nombre: string
  valor: string
  onChange: (v: string) => void
  porDefecto: string
  opciones: Opcion[]
}) {
  return (
    <label className="group/filtro relative flex min-h-[52px] min-w-0 flex-1 cursor-pointer flex-col justify-center rounded-[var(--radius-input)] border border-[var(--color-navy-edge)] bg-white/[0.04] px-3 transition-colors focus-within:border-[var(--color-primary-bright)] hover:border-[var(--color-primary-bright)]">
      <span className="movia-etiqueta movia-etiqueta-navy">{etiqueta}</span>
      <span className="mt-0.5 flex items-center gap-1 pr-4 text-[14px] font-semibold text-white">
        <span className="truncate">{opciones.find((o) => o.valor === valor)?.texto ?? porDefecto}</span>
      </span>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--color-navy-muted)]"
        aria-hidden
      />
      {/* El <select> nativo va encima y transparente: conserva el teclado, el
          lector de pantalla y el selector del telefono, y el rotulo de arriba
          es lo que se ve. */}
      <select
        name={nombre}
        aria-label={etiqueta}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
      >
        <option value="">{porDefecto}</option>
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.texto}
          </option>
        ))}
      </select>
    </label>
  )
}

function Lectura({ etiqueta, valor }: { etiqueta: string; valor: number }) {
  return (
    // El filete divisorio solo a partir de lg, que es donde las cuatro celdas
    // caben en una linea. Al plegarse, first: solo exime a la primera de todas
    // y la primera de la segunda fila se quedaba con un filete suelto delante.
    <div className="min-w-0 pr-8 lg:border-l lg:border-[var(--color-navy-line)] lg:px-4 lg:pr-4 lg:first:border-l-0 lg:first:pl-0">
      <dt className="movia-etiqueta movia-etiqueta-navy truncate">{etiqueta}</dt>
      <dd className="mt-1 text-[26px] font-bold leading-none tracking-[var(--tracking-tight)] tabular-nums text-white">
        {valor}
      </dd>
    </div>
  )
}

export function HeroSearch({
  activos,
  empresas,
  categorias,
  ciudades,
  condiciones,
  ultima,
}: {
  activos: number
  empresas: number
  categorias: { slug: string; name: string }[]
  ciudades: { id: string; name: string }[]
  condiciones: string[]
  ultima?: PublicationCardData
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [categoria, setCategoria] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [ano, setAno] = useState('')
  const [condicion, setCondicion] = useState('')

  function buscar(termino?: string) {
    const p = new URLSearchParams()
    const valor = (termino ?? query).trim()
    if (valor) p.set('q', valor)
    if (categoria) p.set('category', categoria)
    if (ciudad) p.set('city', ciudad)
    if (ano) p.set('minYear', ano)
    if (condicion) p.set('condition', condicion)
    const cadena = p.toString()
    router.push(cadena ? `/buscar?${cadena}` : '/buscar')
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
        className="pointer-events-none absolute -right-24 -top-28 w-[420px] select-none opacity-[0.06] md:w-[560px]"
      />

      <div className="relative mx-auto grid w-full max-w-[1152px] items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
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
            {/* El trazo se dibuja a mano alzada, no es un subrayado: marca la
                palabra que es la marca sin recurrir a otro color. */}
            <span className="relative inline-block whitespace-nowrap text-[var(--color-primary-bright)]">
              muévelo
              <svg
                aria-hidden
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                className="absolute -bottom-1 left-0 h-[10px] w-full"
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

          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-[var(--color-navy-muted)]">
            Maquinaria, equipos e inventarios de empresas verificadas con NIT en{' '}
            {env.locale.countryName}. Busca por modelo, compara fichas técnicas y contacta al
            vendedor el mismo día.
          </p>

          <form
            className="mt-8"
            onSubmit={(e) => {
              e.preventDefault()
              buscar()
            }}
          >
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <div className="flex h-14 flex-1 items-center gap-3 rounded-[var(--radius-input)] bg-white px-4 transition-shadow focus-within:shadow-[0_0_0_3px_rgba(96,165,250,0.35)]">
                <Search className="size-5 shrink-0 text-[var(--color-text-muted)]" aria-hidden />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="¿Qué activo estás buscando?"
                  aria-label="Buscar activos"
                  data-testid="hero-search-input"
                  // self-stretch y min-h: sin ellos el campo se queda en 20 px
                  // de alto dentro del contenedor de 56 y no llega al minimo.
                  className="min-h-[44px] w-full min-w-0 self-stretch bg-transparent text-[16px] text-[var(--color-navy)] outline-none placeholder:text-[var(--color-text-muted)]"
                />
              </div>

              <motion.button
                type="submit"
                data-testid="hero-search-submit"
                whileHover={motionEnabled ? { scale: 1.015 } : undefined}
                whileTap={motionEnabled ? { scale: 0.98 } : undefined}
                className="inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-[var(--radius-input)] bg-[var(--color-primary)] px-8 text-[16px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)]"
              >
                Buscar
                <ArrowRight className="size-4" aria-hidden />
              </motion.button>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-4">
              <Filtro
                etiqueta="Categoría"
                nombre="category"
                valor={categoria}
                onChange={setCategoria}
                porDefecto="Todas"
                opciones={categorias.map((c) => ({ valor: c.slug, texto: c.name }))}
              />
              <Filtro
                etiqueta="Ubicación"
                nombre="city"
                valor={ciudad}
                onChange={setCiudad}
                porDefecto={env.locale.countryName}
                opciones={ciudades.map((c) => ({ valor: c.id, texto: c.name }))}
              />
              <Filtro
                etiqueta="Año"
                nombre="minYear"
                valor={ano}
                onChange={setAno}
                porDefecto="Cualquiera"
                opciones={ANOS.map((a) => ({ valor: String(a), texto: `Desde ${a}` }))}
              />
              <Filtro
                etiqueta="Condición"
                nombre="condition"
                valor={condicion}
                onChange={setCondicion}
                porDefecto="Todas"
                opciones={condiciones.map((c) => ({ valor: c, texto: c }))}
              />
            </div>

            {/* La lectura del instrumento: el corpus sobre el que se busca.
                Dentro de la consulta y con peso, no suelta y en 13 px. */}
            <dl className="mt-6 flex flex-wrap gap-y-4 border-t border-[var(--color-navy-line)] pt-6">
              {/* Rotulos enteros, no "Activos" y "Empresas" a secas: las
                  celdas se dimensionan al contenido y hay sitio de sobra, asi
                  que se dice que son publicados y que estan verificadas. */}
              <Lectura etiqueta="Activos publicados" valor={activos} />
              <Lectura etiqueta="Empresas verificadas" valor={empresas} />
              <Lectura etiqueta="Categorías" valor={categorias.length} />
              <Lectura etiqueta="Ciudades" valor={ciudades.length} />
            </dl>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-2">
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
        </div>

        {/* La ultima publicacion, en vivo. Ocupa el hueco que solo tenia la
            marca de agua y demuestra de un vistazo que el catalogo se mueve.
            Sin foto a proposito: es una placa de datos, que es de lo que va
            este producto. */}
        {ultima ? (
          <Link
            href={`/publicacion/${ultima.slug}`}
            data-testid="hero-ultima"
            className="hidden rounded-[var(--radius-card)] border border-[var(--color-navy-edge)] bg-[var(--color-navy-raised)] p-[var(--pad-card)] transition-colors hover:border-[var(--color-primary-bright)] lg:block"
          >
            <span className="movia-etiqueta text-[var(--color-primary-bright)]">
              Última publicación
            </span>

            <p className="mt-3 text-[16px] font-semibold leading-snug text-white">{ultima.title}</p>

            <dl className="mt-4 border-t border-[var(--color-navy-line)]">
              <Dato etiqueta="Año" valor={ultima.year ? String(ultima.year) : '-'} />
              <Dato
                etiqueta="Horas"
                valor={ultima.usageHours ? `${ultima.usageHours.toLocaleString(env.locale.locale)} h` : '-'}
              />
              <Dato etiqueta="Ubicación" valor={ultima.cityName ?? '-'} />
            </dl>

            <p className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
              <strong className="text-[22px] font-extrabold leading-none tracking-[var(--tracking-display)] tabular-nums text-white">
                {money(ultima.price, ultima.currency)}
              </strong>
              <span className="text-[length:var(--text-label)] text-[var(--color-navy-muted)]">
                {env.tax.label} incl.
              </span>
            </p>
          </Link>
        ) : null}
      </div>
    </motion.section>
  )
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex min-h-[30px] items-baseline justify-between gap-3 border-b border-[var(--color-navy-line)]">
      <dt className="movia-etiqueta movia-etiqueta-navy shrink-0">{etiqueta}</dt>
      <dd className="min-w-0 truncate text-right text-[13px] font-semibold tabular-nums text-white">
        {valor}
      </dd>
    </div>
  )
}
