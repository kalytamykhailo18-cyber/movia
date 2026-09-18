'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, MessageSquare, BadgeCheck, ImageOff } from 'lucide-react'
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

// "compacta" es la tarjeta de catalogo. "destacada" es la misma en formato
// apaisado y con el doble de superficie: una publicacion destacada se paga,
// asi que tiene que verse distinta y no solo llevar un sello encima.
type Variante = 'compacta' | 'destacada'

// Toda maquina industrial lleva remachada una placa de caracteristicas:
// referencia, marca, modelo, ano, potencia. Etiqueta a la izquierda, cifra
// tabulada a la derecha. Aqui cada publicacion es una placa.
function referencia(id: string) {
  return `REF ${id.slice(-6).toUpperCase()}`
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex min-h-[30px] items-baseline justify-between gap-3 border-b border-[var(--color-border)]">
      <dt className="movia-etiqueta min-w-0 truncate">{etiqueta}</dt>
      {/* La etiqueta cede el sitio; la cifra no se parte nunca. */}
      <dd className="shrink-0 whitespace-nowrap text-[13px] font-semibold tabular-nums text-[var(--color-navy)]">
        {valor}
      </dd>
    </div>
  )
}

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
    // Radio 12 y borde de 1 px gris los fija el manual y los verifica
    // design.spec.ts. Lo que cambia es el interior.
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
          'grid flex-1 grid-cols-[124px_minmax(0,1fr)]',
          destacada ? 'md:grid-cols-[240px_minmax(0,1fr)]' : 'sm:flex sm:flex-col',
        )}
      >
        <div
          className={cn(
            'relative overflow-hidden bg-[var(--color-primary-soft)]',
            // En telefono la tarjeta es apaisada: la foto a 4:3 a ancho
            // completo cuesta 285 px por publicacion y obliga a recorrer el
            // catalogo de una en una.
            destacada ? 'h-full min-h-[124px]' : 'h-full min-h-[124px] sm:aspect-[4/3] sm:h-auto sm:min-h-0',
          )}
        >
          {item.photo ? (
            <motion.img
              src={item.photo}
              alt={item.title}
              className="size-full object-cover"
              initial={{ scale: 1 }}
              whileHover={motionEnabled ? { scale: 1.03 } : undefined}
              transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            />
          ) : (
            /* No hay fotografia: el hueco se disena como plano tecnico en vez
               de dejar un rectangulo gris. Es un estado que el producto va a
               tener siempre, porque habra vendedores que publiquen sin foto. */
            <div className="movia-plano flex size-full flex-col items-center justify-center gap-1.5 p-2 text-center">
              <ImageOff className="size-7 opacity-50" aria-hidden />
              <span className="text-[length:var(--text-label)] font-semibold uppercase tracking-[var(--tracking-label)] text-[#93b4e8]">
                Sin fotografia
              </span>
            </div>
          )}

          {/* La chapa remachada: referencia y condicion, que es exactamente lo
              que lleva grabada una placa real. */}
          <span
            className={cn(
              'absolute bottom-0 left-0 inline-flex h-[26px] max-w-full items-center gap-1.5 overflow-hidden',
              'rounded-tr-[var(--radius-input)] px-3 text-[length:var(--text-label)] font-semibold uppercase',
              'tracking-[0.1em] tabular-nums text-white',
              destacada ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-navy)]',
            )}
            data-testid={item.featured ? 'featured-badge' : undefined}
          >
            <span className="truncate">{referencia(item.id)}</span>
            {item.condition ? (
              <>
                <span aria-hidden className={destacada ? 'text-[#BFDBFE]' : 'text-[var(--color-primary-bright)]'}>
                  ·
                </span>
                <span className="truncate">{item.featured ? 'Destacado' : item.condition}</span>
              </>
            ) : null}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-1 flex-col p-[var(--pad-card)]">
            <h3
              className={cn(
                'font-semibold leading-[1.3] tracking-[var(--tracking-tight)] text-[var(--color-navy)]',
                destacada ? 'text-[length:var(--text-subtitle)] md:text-[20px]' : 'text-[length:var(--text-subtitle)]',
              )}
            >
              {/* El enlace ocupa la caja completa del titulo: con una sola
                  linea el area tactil se quedaba en 21 px, la mitad del
                  minimo que pide el manual. */}
              <span className={cn('line-clamp-2 block', destacada ? 'sm:min-h-[2.4em]' : 'sm:min-h-[2.6em]')}>
                {item.title}
              </span>
            </h3>

            {item.year || item.usageHours ? (
              <dl className="mt-3 border-t border-[var(--color-border)]">
                <Dato etiqueta="Ano" valor={item.year ? String(item.year) : '-'} />
                <Dato etiqueta={destacada ? 'Horas de uso' : 'Horas'} valor={horas} />
                {destacada && item.condition ? <Dato etiqueta="Condicion" valor={item.condition} /> : null}
              </dl>
            ) : null}

            <p className="mt-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <strong
                className={cn(
                  'whitespace-nowrap font-extrabold leading-none tracking-[var(--tracking-display)] tabular-nums text-[var(--color-navy)]',
                  destacada ? 'text-[30px]' : 'text-[26px]',
                )}
                data-testid="card-price"
              >
                {money(item.price, item.currency)}
              </strong>
              <span className="text-[length:var(--text-label)] text-[var(--color-text-muted)]">IVA incluido</span>
            </p>
          </div>

          {/* Franja del vendedor: separa quien publica del activo en si. */}
          <div
            className="mt-auto flex items-center justify-between gap-2 border-t border-[var(--color-border)] bg-[var(--color-background)] px-[var(--pad-card)] py-[var(--pad-cell)]"
            data-testid="card-seller"
          >
            <span
              className={cn(
                'inline-flex min-w-0 items-center gap-1.5 text-[13px]',
                item.companyName
                  ? 'font-semibold text-[var(--color-navy)]'
                  : 'font-medium text-[var(--color-text-muted)]',
              )}
            >
              {item.companyVerified ? (
                <BadgeCheck className="size-3.5 shrink-0 text-[var(--color-primary)]" aria-hidden />
              ) : null}
              <span className="truncate">
                {item.companyName ?? 'Persona natural'}
                {item.cityName ? ` · ${item.cityName}` : ''}
              </span>
            </span>

            <span className="flex shrink-0 items-center gap-2.5 text-[length:var(--text-label)] tabular-nums text-[var(--color-text-muted)]">
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
        </div>
      </Link>
    </motion.article>
  )
}
