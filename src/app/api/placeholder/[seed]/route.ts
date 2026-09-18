import { NextResponse } from 'next/server'

// El catalogo todavia no tiene fotografia propia: la mayoria de las
// publicaciones del seed apuntan aqui y el resto no trae foto ninguna. Antes
// eran dos huecos distintos, un icono de foto girado sobre degradado y una
// retícula, uno al lado del otro en la misma rejilla.
//
// Ahora son el mismo hueco, y el hueco dibuja la maquina. El fondo y la
// retícula los pone .movia-plano en el contenedor, en pixeles reales y con el
// mismo paso en cualquier tamano; este archivo dibuja encima, sobre fondo
// transparente: marcas de corte en las esquinas y, en el centro, el alzado
// esquematico del equipo. Un activo sin fotografia se lee entonces como un
// plano sin levantar, que es lo que es, y no como una imagen rota.
//
// El alzado sale del propio identificador, que es el nombre del modelo, asi
// que no hace falta pasarle la categoria ni tocar quien lo consume. Lo que no
// reconoce cae en la diana de registro, que es el hueco neutro.
const ALZADOS: { claves: string[]; d: string }[] = [
  {
    claves: ['torno', 'fresadora', 'prensa', 'rectificadora'],
    d: '<path d="M3 17h18M5 17v-4h6v4M11 13h4l2-3h3v7"/><circle cx="8" cy="9" r="3"/>',
  },
  {
    claves: ['compresor', 'generador', 'bomba', 'planta', 'tanque', 'caldera'],
    d: '<rect x="4" y="9" width="12" height="8" rx="4"/><path d="M16 13h4M18 9v8M8 9V5h5"/>',
  },
  {
    claves: ['camion', 'volqueta', 'furgon', 'tracto', 'remolque', 'bus'],
    d: '<path d="M3 16V7h11v9M14 10h4l3 3.5V16"/><circle cx="7" cy="17.5" r="1.7"/><circle cx="17" cy="17.5" r="1.7"/>',
  },
  {
    claves: ['retroexcavadora', 'excavadora', 'montacargas', 'mezcladora', 'andamio', 'grua'],
    d: '<path d="M3 18h18M5 18v-5h7v5M12 13l3-6 4 2-2 7"/><circle cx="7" cy="18" r="2"/>',
  },
  {
    claves: ['servidor', 'portatil', 'impresora', 'computador', 'switch', 'rack'],
    d: '<rect x="8" y="8" width="8" height="8" rx="1"/><path d="M10 3v3M14 3v3M10 18v3M14 18v3M3 10h3M3 14h3M18 10h3M18 14h3"/>',
  },
]

// La diana de registro, para lo que no tiene alzado propio.
const NEUTRO = `<g stroke="#2563EB" stroke-opacity="0.24" stroke-width="5" fill="none">
    <circle cx="400" cy="300" r="78"/>
    <path d="M 400 168 V 204 M 400 396 V 432 M 268 300 H 304 M 496 300 H 532" stroke-linecap="round"/>
    <path d="M 400 282 V 318 M 382 300 H 418" stroke-opacity="0.4" stroke-linecap="round"/>
  </g>`

function alzado(seed: string) {
  const s = seed.toLowerCase()
  const hallado = ALZADOS.find((a) => a.claves.some((k) => s.includes(k)))
  if (!hallado) return NEUTRO
  // El glifo esta dibujado en un lienzo de 24 y el plano mide 800 x 600.
  return `<g transform="translate(400 300) scale(11) translate(-12 -12)"
    fill="none" stroke="#2563EB" stroke-opacity="0.34" stroke-width="1.4"
    stroke-linecap="round" stroke-linejoin="round">${hallado.d}</g>`
}

export async function GET(_req: Request, ctx: { params: Promise<{ seed: string }> }) {
  const { seed } = await ctx.params

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" fill="none">
  <g stroke="#111827" stroke-opacity="0.16" stroke-width="4" stroke-linecap="square">
    <path d="M 40 96 V 40 H 96"/>
    <path d="M 704 40 H 760 V 96"/>
    <path d="M 760 504 V 560 H 704"/>
    <path d="M 96 560 H 40 V 504"/>
  </g>
  ${alzado(seed)}
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
