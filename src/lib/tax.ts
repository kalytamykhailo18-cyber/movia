import { env } from './env'

export type PriceBreakdown = {
  net: number
  tax: number
  total: number
  rate: number
  label: string
}

export function breakdown(displayPrice: number): PriceBreakdown {
  const rate = env.tax.rate
  if (env.tax.includedInPrice) {
    const net = displayPrice / (1 + rate)
    return {
      net: round(net),
      tax: round(displayPrice - net),
      total: round(displayPrice),
      rate,
      label: env.tax.label,
    }
  }
  const tax = displayPrice * rate
  return {
    net: round(displayPrice),
    tax: round(tax),
    total: round(displayPrice + tax),
    rate,
    label: env.tax.label,
  }
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}
