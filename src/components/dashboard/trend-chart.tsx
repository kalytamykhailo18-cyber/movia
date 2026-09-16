'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { env } from '@/lib/env'

type Point = { date: string; views: number; leads: number }

const WIDTH = 720
const HEIGHT = 200
const PADDING = { top: 16, right: 12, bottom: 28, left: 40 }

export function TrendChart({ data }: { data: Point[] }) {
  const [hover, setHover] = useState<number | null>(null)

  const { viewsPath, leadsPath, areaPath, maxViews, ticks, points } = useMemo(() => {
    const innerW = WIDTH - PADDING.left - PADDING.right
    const innerH = HEIGHT - PADDING.top - PADDING.bottom
    const maxViews = Math.max(10, ...data.map((d) => d.views))
    const maxLeads = Math.max(1, ...data.map((d) => d.leads))

    const x = (i: number) => PADDING.left + (i / Math.max(1, data.length - 1)) * innerW
    const yView = (v: number) => PADDING.top + innerH - (v / maxViews) * innerH
    const yLead = (v: number) => PADDING.top + innerH - (v / maxLeads) * innerH

    const viewsPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${yView(d.views)}`).join(' ')
    const leadsPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${yLead(d.leads)}`).join(' ')
    const areaPath = `${viewsPath} L ${x(data.length - 1)} ${PADDING.top + innerH} L ${x(0)} ${PADDING.top + innerH} Z`

    const ticks = [0, 0.5, 1].map((r) => ({
      y: PADDING.top + innerH - r * innerH,
      label: Math.round(maxViews * r).toString(),
    }))

    const points = data.map((d, i) => ({ ...d, x: x(i), yView: yView(d.views), yLead: yLead(d.leads) }))

    return { viewsPath, leadsPath, areaPath, maxViews, ticks, points }
  }, [data])

  const active = hover !== null ? points[hover] : null

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5" data-testid="trend-chart">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[18px] font-semibold text-[var(--color-navy)]">Tendencia de los ultimos 30 dias</h2>
        <div className="flex items-center gap-4 text-[12px]">
          <span className="inline-flex items-center gap-1.5 text-[var(--color-text-muted)]">
            <span className="size-3 rounded-full bg-[var(--color-primary)]" />
            Visualizaciones
          </span>
          <span className="inline-flex items-center gap-1.5 text-[var(--color-text-muted)]">
            <span className="size-3 rounded-full bg-[var(--color-accent)]" />
            Contactos
          </span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-[200px] w-full min-w-[520px]"
          role="img"
          aria-label="Tendencia de visualizaciones y contactos"
          onMouseLeave={() => setHover(null)}
        >
          {ticks.map((tick) => (
            <g key={tick.label}>
              <line
                x1={PADDING.left}
                x2={WIDTH - PADDING.right}
                y1={tick.y}
                y2={tick.y}
                stroke="var(--color-border)"
                strokeDasharray="3 3"
              />
              <text x={PADDING.left - 8} y={tick.y + 4} textAnchor="end" fontSize="11" fill="var(--color-text-muted)">
                {tick.label}
              </text>
            </g>
          ))}

          <motion.path
            d={areaPath}
            fill="var(--color-primary)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.08 }}
            transition={{ duration: env.ui.durationSlow, delay: 0.2 }}
          />

          <motion.path
            d={viewsPath}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          />

          <motion.path
            d={leadsPath}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeDasharray="4 4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          />

          {points.map((point, i) => (
            <rect
              key={point.date}
              x={point.x - 6}
              y={PADDING.top}
              width={12}
              height={HEIGHT - PADDING.top - PADDING.bottom}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          ))}

          {active ? (
            <g>
              <line
                x1={active.x}
                x2={active.x}
                y1={PADDING.top}
                y2={HEIGHT - PADDING.bottom}
                stroke="var(--color-navy)"
                strokeOpacity="0.2"
              />
              <circle cx={active.x} cy={active.yView} r="4" fill="var(--color-primary)" />
              <circle cx={active.x} cy={active.yLead} r="3.5" fill="var(--color-accent)" />
            </g>
          ) : null}
        </svg>
      </div>

      <p className="mt-2 min-h-[20px] text-[12px] text-[var(--color-text-muted)]" data-testid="trend-tooltip">
        {active
          ? `${active.date}: ${active.views} visualizaciones, ${active.leads} contactos`
          : `Pico de ${maxViews} visualizaciones en un dia`}
      </p>
    </div>
  )
}
