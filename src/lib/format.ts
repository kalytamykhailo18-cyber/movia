import { env } from './env'

export function money(value: number, currency = env.locale.currency): string {
  return new Intl.NumberFormat(env.locale.locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function shortDate(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat(env.locale.locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function relativeDays(value: Date | string): number {
  const date = typeof value === 'string' ? new Date(value) : value
  return Math.ceil((date.getTime() - Date.now()) / 86400000)
}

export function compactNumber(value: number): string {
  return new Intl.NumberFormat(env.locale.locale, { notation: 'compact' }).format(value)
}
