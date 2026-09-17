import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

const TIPOS: Record<string, string> = {
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.avif': 'image/avif',
}

// Next no sirve lo que se escribe en public despues de arrancar, asi que las
// imagenes subidas viven fuera y se entregan por aqui. En el servidor, Caddy
// las toma antes desde disco; esta ruta es el respaldo y hace portable el
// despliegue a otra infraestructura.
export async function GET(_req: Request, ctx: { params: Promise<{ ruta: string[] }> }) {
  const { ruta } = await ctx.params

  const base = path.resolve(process.cwd(), env.storage.localPath)
  const destino = path.resolve(base, ...ruta)

  // Nunca salir de la carpeta de subidas.
  if (!destino.startsWith(base + path.sep)) {
    return new NextResponse('No encontrado', { status: 404 })
  }

  const tipo = TIPOS[path.extname(destino).toLowerCase()]
  if (!tipo) return new NextResponse('No encontrado', { status: 404 })

  try {
    const info = await stat(destino)
    if (!info.isFile()) return new NextResponse('No encontrado', { status: 404 })

    const stream = createReadStream(destino) as unknown as ReadableStream
    return new NextResponse(stream, {
      headers: {
        'Content-Type': tipo,
        'Content-Length': String(info.size),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('No encontrado', { status: 404 })
  }
}
