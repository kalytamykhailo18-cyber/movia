'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Eye, MessageSquare, BadgeCheck, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { money } from '@/lib/format'
import { cardVariants, motionEnabled } from '@/lib/motion'

export type PublicationCardData = {
  id: string
  slug: string
  title: string
  price: number
  currency: string
  condition: string | null
  year: number | null
  usageHours: number | null
  cityName: string | null
  photo: string | null
  featured: boolean
  publishedAt: string
  viewCount: number
  leadCount: number
  companyName: string | null
  companyVerified: boolean
}

// "compacta" es la tarjeta de catalogo. "destacada" es la misma tarjeta en
// formato apaisado y con el doble de superficie: una publicacion destacada se
// paga, asi que tiene que verse distinta y no solo llevar un sello encima.
type Variante = 'compacta' | 'destacada'

function Especificacion({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="min-w-0">
      <dt className="movia-etiqueta truncate">{etiqueta}</dt>
      <dd className="mt-1 truncate text-[13px] font-semibold leading-tight tabular-nums text-[var(--color-navy)]">
        {valor}
      </dd>
    </div>
  )
}

function Vendedor({ item }: { item: PublicationCardData }) {
  return (
    <div
      className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--color-border)] bg-[var(--color-background)] px-[var(--pad-card)] py-[var(--pad-cell)]"
      data-testid="card-seller"
    >
      <span
        className={cn(
          'inline-flex min-w-0 items-center gap-1.5 text-[12px]',
          item.companyName
            ? 'font-semibold text-[var(--color-navy)]'
            : 'font-medium text-[var(--color-text-muted)]',
        )}
      >
        {item.companyVerified ? (
          <BadgeCheck className="size-3.5 shrink-0 text-[var(--color-primary)]" aria-hidden />
        ) : null}
        <span className="truncate">{item.companyName ?? 'Persona natural'}</span>
      </span>

      <span className="flex shrink-0 items-center gap-2.5 text-[var(--text-label)] tabular-nums text-[var(--color-text-muted)]">
        <span className="inline-flex items-center gap-1" title="Visualizaciones">
          <Eye className="size-3.5" aria-hidden />
          {item.viewCount}
        </span>
        <span className="inline-flex items-center gap-1" title="Contactos">
          <MessageSquare className="size-3.5" aria-hidden />
          {item.leadCount}
        </span>
      </span>
    </div>
  )
}

function Foto({ item, destacada }: { item: PublicationCardData; destacada: boolean }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-[var(--color-background)]',
        // En telefono la tarjeta es apaisada: la foto a 4:3 a ancho completo
        // se comia 285 px por publicacion y obligaba a recorrer el catalogo
        // de una en una. A partir de 640 vuelve a ser rejilla vertical.
        destacada
          ? 'h-full min-h-[132px]'
          : 'h-full min-h-[132px] sm:aspect-[4/3] sm:h-auto sm:min-h-0',
      )}
    >
      {item.photo ? (
        <motion.img
          src={item.photo}
          alt={item.title}
          className="size-full object-cover"
          initial={{ scale: 1 }}
          whileHover={motionEnabled ? { scale: 1.03 } : undefined}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      ) : (
        <div className="flex size-full items-center justify-center p-2 text-center text-[12px] text-[var(--color-text-muted)]">
          Sin fotografia
        </div>
      )}

      {item.featured ? (
        /* El filo sigue el angulo de 58 grados del isotipo, el unico recurso
           geometrico propio que tiene la marca. */
        <span
          className="absolute left-0 top-0 inline-flex h-7 items-center gap-1.5 bg-[var(--color-navy)] pl-3 pr-4 text-[var(--text-label)] font-semibold uppercase tracking-[0.06em] text-white [clip-path:polygon(0_0,100%_0,calc(100%-10px)_100%,0_100%)]"
          data-testid="featured-badge"
        >
          <Star className="size-3" aria-hidden />
          Destacado
        </span>
      ) : null}
    </div>
  )
}

// Radio 12 y borde de 1 px gris los fija el manual y los verifica
// tests/e2e/design.spec.ts. Lo que cambia es el interior.
export function PublicationCard({
  item,
  index = 0,
  variante = 'compacta',
  className,
}: {
  item: PublicationCardData
  index?: number
  variante?: Variante
  className?: string
}) {
  const destacada = variante === 'destacada'
  const horas = item.usageHours ? `${item.usageHours.toLocaleString('es-CO')} h` : '-'

  return (
    <motion.article
      variants={motionEnabled ? cardVariants : undefined}
      initial="hidden"
      animate="show"
      whileHover="hover"
      whileTap="tap"
      custom={index}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)]',
        'bg-white shadow-[var(--shadow-card)] transition-[box-shadow,border-color] duration-200',
        'hover:border-[#BFDBFE] hover:shadow-[var(--shadow-card-hover)]',
        className,
      )}
      data-testid="publication-card"
    >
      <Link
        href={`/publicacion/${item.slug}`}
        className={cn(
          'grid flex-1 grid-cols-[132px_minmax(0,1fr)]',
          destacada ? 'md:grid-cols-[240px_minmax(0,1fr)]' : 'sm:flex sm:flex-col',
        )}
      >
        <Foto item={item} destacada={destacada} />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-1 flex-col p-[var(--pad-card)]">
            <h3
              className={cn(
                'font-semibold leading-snug tracking-[var(--tracking-tight)] text-[var(--color-navy)]',
                destacada ? 'text-[18px] md:text-[20px]' : 'text-[18px]',
              )}
            >
              {/* El enlace ocupa la caja completa del titulo: con una sola
                  linea el area tactil se quedaba en 21 px, la mitad del minimo. */}
              {/* El alto minimo alinea los titulos entre columnas de la
                  rejilla. En la tarjeta apaisada de telefono solo dejaria
                  hueco, asi que solo aplica a partir de 640. */}
              <span
                className={cn(
                  'line-clamp-2 block',
                  destacada ? 'min-h-[2.4em]' : 'sm:min-h-[2.7em]',
                )}
              >
                {item.title}
              </span>
            </h3>

            <p
              className={cn(
                'mt-2 font-bold leading-none tracking-[var(--tracking-display)] tabular-nums text-[var(--color-navy)]',
                destacada ? 'text-[26px]' : 'mt-3 text-[24px]',
              )}
              data-testid="card-price"
            >
              {money(item.price, item.currency)}
            </p>

            {/* Solo cifras. La condicion es cualitativa y no cabe como tercera
                columna sin truncarse: va como distintivo, mas abajo. */}
            {item.year || item.usageHours ? (
              <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-[var(--color-border)] pt-3">
                <Especificacion etiqueta="Ano" valor={item.year ? String(item.year) : '-'} />
                <Especificacion etiqueta="Horas" valor={horas} />
              </dl>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-[var(--color-text-muted)]">
              {item.cityName ? (
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <MapPin className="size-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{item.cityName}</span>
                </span>
              ) : null}
              {/* La condicion es un dato cualitativo, no una cifra: distintivo,
                  no columna de la franja de especificaciones. */}
              {item.condition ? (
                <span className="inline-flex h-[22px] items-center whitespace-nowrap rounded-full border border-[var(--color-border)] bg-white px-2 text-[var(--text-label)] font-semibold tracking-[0.04em] text-[var(--color-navy)]">
                  {item.condition}
                </span>
              ) : null}
            </div>
          </div>

          <Vendedor item={item} />
        </div>
      </Link>
    </motion.article>
  )
}
