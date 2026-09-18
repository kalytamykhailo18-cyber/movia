import { NextResponse } from 'next/server'

// El catalogo todavia no tiene fotografia propia: 26 de las 37 publicaciones
// del seed apuntan aqui y el resto no trae foto ninguna. Antes eran dos huecos
// distintos, un icono de foto girado sobre degradado y una retícula, uno al
// lado del otro en la misma rejilla.
//
// Ahora son el mismo hueco. El fondo y la retícula los pone .movia-plano en el
// contenedor, en pixeles reales y con el mismo paso en cualquier tamano; este
// archivo solo dibuja encima, sobre fondo transparente. Un activo sin
// fotografia se lee entonces como un plano sin levantar, que es lo que es, y
// no como una imagen rota.
//
// Sin texto a proposito: el mismo dibujo se sirve a 124 px en la tarjeta y a
// 600 en la galeria, y cualquier rotulo quedaria ilegible en el primero.
export async function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" fill="none">
  <g stroke="#111827" stroke-opacity="0.16" stroke-width="4" stroke-linecap="square">
    <path d="M 40 96 V 40 H 96"/>
    <path d="M 704 40 H 760 V 96"/>
    <path d="M 760 504 V 560 H 704"/>
    <path d="M 96 560 H 40 V 504"/>
  </g>

  <g stroke="#2563EB" stroke-opacity="0.24" stroke-width="5">
    <circle cx="400" cy="300" r="78"/>
    <path d="M 400 168 V 204 M 400 396 V 432 M 268 300 H 304 M 496 300 H 532" stroke-linecap="round"/>
    <path d="M 400 282 V 318 M 382 300 H 418" stroke-opacity="0.4" stroke-linecap="round"/>
  </g>
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
