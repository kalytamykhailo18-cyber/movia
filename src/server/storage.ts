import { randomUUID } from 'node:crypto'
import { mkdir, writeFile, unlink } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { env } from '@/lib/env'

export const IMAGENES_PERMITIDAS = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

export type ImagenGuardada = {
  url: string
  miniatura: string
  ancho: number
  alto: number
  bytes: number
}

export type ErrorDeSubida = { error: string }

function carpetaDelDia() {
  const hoy = new Date()
  return `${hoy.getUTCFullYear()}/${String(hoy.getUTCMonth() + 1).padStart(2, '0')}`
}

export async function guardarImagen(file: File): Promise<ImagenGuardada | ErrorDeSubida> {
  if (!IMAGENES_PERMITIDAS.includes(file.type)) {
    return { error: 'Formato no admitido. Usa JPG, PNG, WebP o AVIF.' }
  }

  const maxBytes = env.storage.maxImageMb * 1024 * 1024
  if (file.size > maxBytes) {
    return { error: `La imagen supera ${env.storage.maxImageMb} MB.` }
  }

  const entrada = Buffer.from(await file.arrayBuffer())

  let meta: Awaited<ReturnType<ReturnType<typeof sharp>['metadata']>>
  try {
    meta = await sharp(entrada).metadata()
  } catch {
    return { error: 'El archivo no es una imagen valida.' }
  }

  if (!meta.width || !meta.height) {
    return { error: 'No pudimos leer las dimensiones de la imagen.' }
  }

  if (meta.width < env.storage.minImageWidth || meta.height < env.storage.minImageWidth) {
    return {
      error: `La imagen es muy pequena. Minimo ${env.storage.minImageWidth} px por lado.`,
    }
  }

  const id = randomUUID()
  const relativa = `${carpetaDelDia()}/${id}`
  const destino = path.join(process.cwd(), env.storage.localPath, carpetaDelDia())
  await mkdir(destino, { recursive: true })

  // Se reescribe siempre: normaliza el formato, quita metadatos (incluida la
  // ubicacion GPS de las fotos de celular) y acota el peso que se sirve.
  const principal = await sharp(entrada)
    .rotate()
    .resize({
      width: env.storage.maxImageWidth,
      height: env.storage.maxImageWidth,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 82 })
    .toBuffer()

  const miniatura = await sharp(entrada)
    .rotate()
    .resize({ width: env.storage.thumbWidth, height: env.storage.thumbWidth, fit: 'cover' })
    .webp({ quality: 72 })
    .toBuffer()

  await writeFile(path.join(destino, `${id}.webp`), principal)
  await writeFile(path.join(destino, `${id}-thumb.webp`), miniatura)

  const salida = await sharp(principal).metadata()

  return {
    url: `${env.storage.publicUrl}/${relativa}.webp`,
    miniatura: `${env.storage.publicUrl}/${relativa}-thumb.webp`,
    ancho: salida.width ?? 0,
    alto: salida.height ?? 0,
    bytes: principal.byteLength,
  }
}

export async function borrarImagen(url: string): Promise<void> {
  if (!url.startsWith(env.storage.publicUrl)) return

  const relativa = url.slice(env.storage.publicUrl.length).replace(/^\//, '')
  const base = path.join(process.cwd(), env.storage.localPath, relativa)

  await Promise.allSettled([unlink(base), unlink(base.replace(/\.webp$/, '-thumb.webp'))])
}
