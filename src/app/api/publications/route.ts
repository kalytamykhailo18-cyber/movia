import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { env } from '@/lib/env'
import { slugify } from '@/lib/utils'
import { scoreCompleteness } from '@/lib/completeness'
import { getSessionUser } from '@/lib/auth'

const schema = z.object({
  title: z.string().trim().min(3).max(160),
  categoryId: z.string().min(1),
  price: z.number().positive(),
  brand: z.string().trim().max(80).optional().nullable(),
  model: z.string().trim().max(80).optional().nullable(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).nullable().optional(),
  usageHours: z.number().int().min(0).nullable().optional(),
  condition: z.string().trim().max(60).optional().nullable(),
  cityId: z.string().optional().nullable(),
  description: z.string().trim().max(5000).optional().nullable(),
  specs: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  photos: z.array(z.string()).max(env.publication.maxPhotos).optional(),
  durationDays: z.number().int().optional(),
})

export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Debes iniciar sesion para publicar' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos invalidos', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const data = parsed.data

  const category = await db.category.findUnique({
    where: { id: data.categoryId },
    select: { id: true, attributes: { where: { required: true }, select: { key: true, label: true } } },
  })
  if (!category) {
    return NextResponse.json({ error: 'Categoria no encontrada' }, { status: 404 })
  }

  const specs = data.specs ?? {}
  const missingRequired = category.attributes.filter((a) => !specs[a.key])
  if (missingRequired.length) {
    return NextResponse.json(
      { error: `Faltan especificaciones obligatorias: ${missingRequired.map((a) => a.label).join(', ')}` },
      { status: 400 },
    )
  }

  if (data.cityId) {
    const city = await db.city.findUnique({ where: { id: data.cityId }, select: { id: true } })
    if (!city) return NextResponse.json({ error: 'Ciudad no encontrada' }, { status: 404 })
  }

  const country = await db.country.findUnique({
    where: { isoCode: env.locale.countryCode },
    select: { id: true, currency: true },
  })
  if (!country) {
    return NextResponse.json({ error: 'Pais no configurado' }, { status: 500 })
  }

  // La publicacion queda a nombre de quien la crea. Sin empresa es una
  // publicacion de persona natural, que el modelo admite.
  const companyId = user.companyId

  const photos = data.photos ?? []
  const completeness = scoreCompleteness({
    title: data.title,
    description: data.description,
    brand: data.brand,
    model: data.model,
    year: data.year ?? null,
    usageHours: data.usageHours ?? null,
    condition: data.condition,
    cityId: data.cityId ?? null,
    price: data.price,
    photos,
    documents: [],
    specs,
  })

  const durationDays = data.durationDays ?? env.publication.durationLongDays

  const publication = await db.publication.create({
    data: {
      slug: `${slugify(data.title)}-${Math.random().toString(36).slice(2, 8)}`,
      title: data.title,
      description: data.description ?? null,
      categoryId: category.id,
      companyId,
      brand: data.brand ?? null,
      model: data.model ?? null,
      year: data.year ?? null,
      usageHours: data.usageHours ?? null,
      condition: data.condition ?? null,
      price: data.price,
      currency: country.currency,
      countryId: country.id,
      cityId: data.cityId || null,
      photos: JSON.stringify(photos),
      documents: '[]',
      specs: JSON.stringify(specs),
      status: 'active',
      completeness: completeness.score,
      expiresAt: new Date(Date.now() + durationDays * 86400000),
    },
    select: { id: true, slug: true, completeness: true },
  })

  await db.auditLog.create({
    data: {
      actorId: user.id,
      actorEmail: user.email,
      action: 'publication_create',
      entity: 'publication',
      entityId: publication.id,
      payload: JSON.stringify({ completeness: publication.completeness }),
    },
  })

  return NextResponse.json(
    { ok: true, id: publication.id, slug: publication.slug, completeness: publication.completeness },
    { status: 201 },
  )
}
