'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, MessageSquare, BadgeCheck } from 'lucide-react'
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

// Un unico origen para el hueco sin fotografia, para que no haya dos.
const SIN_FOTOGRAFIA = '/api/placeholder/sin-fotografia'

// Toda maquina industrial lleva remachada una placa de caracteristicas:
// referencia, marca, modelo, ano, potencia. Etiqueta a la izquierda, cifra
// tabulada a la derecha. Aqui cada publicacion es una placa.
function referencia(id: string) {
  return `REF ${id.slice(-6).toUpperCase()}`
}

// 33 de las 37 publicaciones traen la condicion con el prefijo "Usado - ".
// En un catalogo de maquinaria de segunda mano ese prefijo no informa de nada:
// lo que distingue una maquina de otra es el grado. La ficha conserva el valor
// entero, que ahi hay sitio y es la pagina donde se decide; la tarjeta, que es
// densa, muestra solo el grado.
function grado(condicion: string) {
  const corte = condicion.replace(/^usado\s*-\s*/i, '')
  return corte.charAt(0).toUpperCase() + corte.slice(1)
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex min-h-[30px] items-baseline justify-between gap-3 border-b border-[var(--color-border)]">
      {/* Las etiquetas son cortas y conocidas, asi que no ceden ancho. El que
          cede es el valor, que es el unico que puede traer texto largo. */}
      <dt className="movia-etiqueta shrink-0">{etiqueta}</dt>
      <dd className="min-w-0 truncate text-right text-[13px] font-semibold tabular-nums text-[var(--color-navy)]">
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
            // La retícula va siempre en el contenedor, no solo cuando falta
            // la foto: asi el marcador generado, que llega con fondo
            // transparente, se apoya en el mismo plano y a la misma escala
            // que el hueco vacio. Una fotografia real la tapa entera.
            'movia-plano relative overflow-hidden',
            // En telefono la tarjeta es apaisada: la foto a 4:3 a ancho
            // completo cuesta 285 px por publicacion y obliga a recorrer el
            // catalogo de una en una.
            destacada ? 'h-full min-h-[124px]' : 'h-full min-h-[124px] sm:aspect-[4/3] sm:h-auto sm:min-h-0',
          )}
        >
          {/* Falte la foto o venga apuntada al marcador generado, es el mismo
              estado y se dibuja igual: el mismo plano, sin dos huecos
              distintos en la misma rejilla. Un rotulo "sin fotografia" en 35
              de las 37 tarjetas seria ruido; quien necesita el dato lo tiene
              en la ficha, donde hay sitio para leerlo. */}
          <motion.img
            src={item.photo ?? SIN_FOTOGRAFIA}
            alt={item.photo ? item.title : ''}
            aria-hidden={item.photo ? undefined : true}
            className="size-full object-cover"
            initial={{ scale: 1 }}
            whileHover={motionEnabled && item.photo ? { scale: 1.03 } : undefined}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* La chapa remachada, con la referencia grabada. Solo lleva lo que
              cabe entero: en la tarjeta compacta la placa mide 124 px y
              cualquier segundo dato se partia a media palabra. Alli lo
              destacado lo dice el color de la chapa, no una palabra mas; la
              condicion baja a las filas de datos, donde tiene el ancho de la
              tarjeta. */}
          <span
            className={cn(
              'absolute bottom-0 left-0 inline-flex h-[26px] max-w-full items-center gap-1.5',
              'rounded-tr-[var(--radius-input)] px-3 text-[length:var(--text-label)] font-semibold uppercase',
              'tracking-[0.1em] tabular-nums text-white',
              item.featured ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-navy)]',
            )}
            data-testid={item.featured ? 'featured-badge' : undefined}
          >
            <span className="whitespace-nowrap">{referencia(item.id)}</span>
            {destacada && item.featured ? (
              <>
                <span aria-hidden className="text-[#BFDBFE]">
                  ·
                </span>
                <span className="whitespace-nowrap">Destacado</span>
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

            {item.year || item.usageHours || item.condition ? (
              <dl className="mt-3 border-t border-[var(--color-border)]">
                {item.year || item.usageHours ? (
                  <>
                    <Dato etiqueta="Año" valor={item.year ? String(item.year) : '-'} />
                    <Dato etiqueta={destacada ? 'Horas de uso' : 'Horas'} valor={horas} />
                  </>
                ) : null}
                {item.condition ? <Dato etiqueta="Estado" valor={grado(item.condition)} /> : null}
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
