import sharp from 'sharp'
import { writeFileSync, existsSync } from 'node:fs'

// Imagenes reales para las pruebas de subida. Se generan una vez.
const salidas = [
  { archivo: 'foto-activo.jpg', w: 1600, h: 1200, color: { r: 38, g: 92, b: 196 } },
  { archivo: 'foto-activo-2.jpg', w: 1400, h: 1050, color: { r: 20, g: 130, b: 90 } },
  { archivo: 'foto-activo-3.jpg', w: 1200, h: 1200, color: { r: 150, g: 90, b: 30 } },
  { archivo: 'foto-pequena.jpg', w: 120, h: 90, color: { r: 200, g: 40, b: 40 } },
]

for (const s of salidas) {
  const ruta = new URL(s.archivo, import.meta.url).pathname.replace(/^\//, '')
  if (existsSync(ruta)) continue
  const buf = await sharp({ create: { width: s.w, height: s.h, channels: 3, background: s.color } })
    .jpeg({ quality: 80 })
    .toBuffer()
  writeFileSync(ruta, buf)
  console.log('creada', s.archivo, `${s.w}x${s.h}`)
}
