import { db } from '@/lib/db'
import { env } from '@/lib/env'
import { parseJson } from '@/lib/utils'
import type { PublicationCardData } from '@/components/publication-card'

const CARD_SELECT = {
  id: true,
  slug: true,
  title: true,
  price: true,
  currency: true,
  condition: true,
  // El comprador llega sabiendo el modelo y compara cifras, asi que ano y
  // horas viajan con la tarjeta y no quedan detras de un clic.
  year: true,
  usageHours: true,
  photos: true,
  featured: true,
  publishedAt: true,
  viewCount: true,
  leadCount: true,
  city: { select: { name: true } },
  company: { select: { name: true, verificationStatus: true } },
} as const

type CardRow = {
  id: string
  slug: string
  title: string
  price: number
  currency: string
  condition: string | null
  year: number | null
  usageHours: number | null
  photos: string
  featured: boolean
  publishedAt: Date
  viewCount: number
  leadCount: number
  city: { name: string } | null
  company: { name: string; verificationStatus: string } | null
}

export function toCard(row: CardRow): PublicationCardData {
  const photos = parseJson<string[]>(row.photos, [])
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    price: row.price,
    currency: row.currency,
    condition: row.condition,
    year: row.year,
    usageHours: row.usageHours,
    cityName: row.city?.name ?? null,
    photo: photos[0] ?? null,
    featured: row.featured,
    publishedAt: row.publishedAt.toISOString(),
    viewCount: row.viewCount,
    leadCount: row.leadCount,
    companyName: row.company?.name ?? null,
    companyVerified: row.company?.verificationStatus === 'approved',
  }
}

export async function getFeatured(limit = 4) {
  const rows = await db.publication.findMany({
    where: { status: 'active', featured: true },
    select: CARD_SELECT,
    orderBy: { publishedAt: 'desc' },
    take: limit,
  })
  return rows.map(toCard)
}

export async function getLatest(limit = 8) {
  const rows = await db.publication.findMany({
    where: { status: 'active' },
    select: CARD_SELECT,
    orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
    take: limit,
  })
  return rows.map(toCard)
}

export async function getCategories() {
  return db.category.findMany({
    where: { active: true },
    orderBy: { position: 'asc' },
    select: {
      id: true,
      slug: true,
      name: true,
      icon: true,
      _count: { select: { publications: { where: { status: 'active' } } } },
    },
  })
}

export async function getVerifiedCompanies(limit = 4) {
  return db.company.findMany({
    where: { verificationStatus: 'approved' },
    orderBy: { createdAt: 'asc' },
    take: limit,
    select: {
      id: true,
      name: true,
      description: true,
      badges: true,
      verificationStatus: true,
      city: { select: { name: true } },
      _count: { select: { publications: { where: { status: 'active' } } } },
    },
  })
}

export type SearchParams = {
  q?: string
  category?: string
  city?: string
  condition?: string
  minPrice?: number
  maxPrice?: number
  minYear?: number
  specs?: Record<string, string>
  sort?: string
  page?: number
  pageSize?: number
}

export async function searchPublications(params: SearchParams) {
  const pageSize = Math.min(params.pageSize ?? env.search.pageSize, env.search.maxPageSize)
  const page = Math.max(1, params.page ?? 1)

  const where: Record<string, unknown> = { status: 'active' }
  const and: Record<string, unknown>[] = []

  if (params.q?.trim()) {
    const term = params.q.trim()
    and.push({
      OR: [
        { title: { contains: term } },
        { description: { contains: term } },
        { brand: { contains: term } },
        { model: { contains: term } },
        { specs: { contains: term } },
      ],
    })
  }

  if (params.category) and.push({ category: { slug: params.category } })
  if (params.city) and.push({ city: { name: params.city } })
  if (params.condition) and.push({ condition: params.condition })
  if (typeof params.minPrice === 'number') and.push({ price: { gte: params.minPrice } })
  if (typeof params.maxPrice === 'number') and.push({ price: { lte: params.maxPrice } })
  if (typeof params.minYear === 'number') and.push({ year: { gte: params.minYear } })

  if (params.specs) {
    for (const [key, value] of Object.entries(params.specs)) {
      if (!value) continue
      and.push({ specs: { contains: `"${key}":"${value}"` } })
    }
  }

  if (and.length) where.AND = and

  const orderBy =
    params.sort === 'price_asc'
      ? [{ price: 'asc' as const }]
      : params.sort === 'price_desc'
        ? [{ price: 'desc' as const }]
        : params.sort === 'views'
          ? [{ viewCount: 'desc' as const }]
          : [{ featured: 'desc' as const }, { publishedAt: 'desc' as const }]

  const [rows, total] = await Promise.all([
    db.publication.findMany({
      where,
      select: CARD_SELECT,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.publication.count({ where }),
  ])

  return {
    items: rows.map(toCard),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export async function getPublicationBySlug(slug: string) {
  return db.publication.findUnique({
    where: { slug },
    include: {
      category: { include: { attributes: { orderBy: { position: 'asc' } } } },
      city: true,
      country: true,
      company: {
        include: {
          city: true,
          _count: { select: { publications: { where: { status: 'active' } }, followers: true } },
        },
      },
    },
  })
}

export async function getSimilar(publicationId: string, categoryId: string, limit = 4) {
  const rows = await db.publication.findMany({
    where: { status: 'active', categoryId, NOT: { id: publicationId } },
    select: CARD_SELECT,
    orderBy: { viewCount: 'desc' },
    take: limit,
  })
  return rows.map(toCard)
}

export async function getFilterOptions() {
  const [cities, conditions] = await Promise.all([
    db.city.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    db.publication.findMany({
      where: { status: 'active', condition: { not: null } },
      select: { condition: true },
      distinct: ['condition'],
    }),
  ])

  return {
    cities,
    conditions: conditions.map((c) => c.condition).filter((c): c is string => Boolean(c)),
  }
}
