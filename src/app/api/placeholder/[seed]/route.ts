import { NextResponse } from 'next/server'

const TONES = [
  ['#EFF6FF', '#DBEAFE'],
  ['#F8FAFC', '#E5E7EB'],
  ['#EEF2FF', '#E0E7FF'],
  ['#F1F5F9', '#E2E8F0'],
]

function hash(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0
  return h
}

export async function GET(_req: Request, ctx: { params: Promise<{ seed: string }> }) {
  const { seed } = await ctx.params
  const h = hash(seed)
  const [bg, fg] = TONES[h % TONES.length]
  const angle = h % 45

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="${fg}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" fill="url(#g)"/>
  <g transform="translate(400 300) rotate(${angle})" opacity="0.35">
    <rect x="-120" y="-80" width="240" height="160" rx="16" fill="none" stroke="#2563EB" stroke-width="6"/>
    <circle cx="-60" cy="-20" r="26" fill="none" stroke="#111827" stroke-width="6"/>
    <path d="M -20 40 L 40 -30 L 100 40" fill="none" stroke="#2563EB" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
