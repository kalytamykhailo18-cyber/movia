import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { env } from '@/lib/env'
import { guardarImagen } from '@/server/storage'

export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Debes iniciar sesion para subir fotos' }, { status: 401 })
  }

  const form = await req.formData().catch(() => null)
  const archivos = form?.getAll('file').filter((f): f is File => f instanceof File) ?? []

  if (!archivos.length) {
    return NextResponse.json({ error: 'No se recibio ninguna imagen' }, { status: 400 })
  }

  if (archivos.length > env.publication.maxPhotos) {
    return NextResponse.json(
      { error: `Maximo ${env.publication.maxPhotos} fotos por publicacion` },
      { status: 413 },
    )
  }

  const subidas = []
  for (const archivo of archivos) {
    const resultado = await guardarImagen(archivo)
    if ('error' in resultado) {
      return NextResponse.json({ error: `${archivo.name}: ${resultado.error}` }, { status: 400 })
    }
    subidas.push(resultado)
  }

  return NextResponse.json({ ok: true, imagenes: subidas }, { status: 201 })
}
