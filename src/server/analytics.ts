import { db } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'
import { env } from '@/lib/env'
import { parseJson } from '@/lib/utils'

const EVENT_TYPES = {
  view: 'view',
  favorite: 'favorite',
  whatsapp: 'whatsapp_click',
  email: 'email_click',
  chat: 'chat_start',
} as const

export type CompanySummary = {
  company: {
    id: string
    name: string
    verificationStatus: string
    badges: string[]
    createdAt: Date
    responseTimeMins: number | null
    followers: number
  }
  totals: {
    views: number
    leads: number
    favorites: number
    whatsappClicks: number
    emailClicks: number
    chatsStarted: number
    followers: number
  }
  publications: {
    active: number
    sold: number
    expired: number
    withdrawn: number
    total: number
  }
  subscription: {
    planName: string
    status: string
    quotaUsed: number
    quotaTotal: number
    expiresAt: Date
    autoRenew: boolean
  } | null
  trend: { date: string; views: number; leads: number }[]
  leadsBySource: { source: string; count: number }[]
}

export async function getCompanySummary(companyId: string, days = 30): Promise<CompanySummary | null> {
  const company = await db.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      verificationStatus: true,
      badges: true,
      createdAt: true,
      responseTimeMins: true,
      _count: { select: { followers: true } },
    },
  })
  if (!company) return null

  const since = new Date(Date.now() - days * 86400000)

  const [publications, events, leads, subscription] = await Promise.all([
    db.publication.findMany({
      where: { companyId },
      select: { id: true, status: true, viewCount: true, favoriteCount: true, leadCount: true },
    }),
    db.analyticsEvent.findMany({
      where: { publication: { companyId }, createdAt: { gte: since } },
      select: { type: true, createdAt: true },
    }),
    db.lead.findMany({
      where: { publication: { companyId }, createdAt: { gte: since } },
      select: { source: true, createdAt: true },
    }),
    db.subscription.findFirst({
      where: { companyId, status: 'active' },
      orderBy: { startedAt: 'desc' },
      select: {
        status: true,
        quotaUsed: true,
        expiresAt: true,
        autoRenew: true,
        plan: { select: { name: true, publicationQuota: true } },
      },
    }),
  ])

  const countType = (type: string) => events.filter((e) => e.type === type).length

  const byDay = new Map<string, { views: number; leads: number }>()
  for (let i = days - 1; i >= 0; i--) {
    const key = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
    byDay.set(key, { views: 0, leads: 0 })
  }
  for (const event of events) {
    if (event.type !== EVENT_TYPES.view) continue
    const key = event.createdAt.toISOString().slice(0, 10)
    const bucket = byDay.get(key)
    if (bucket) bucket.views += 1
  }
  for (const lead of leads) {
    const key = lead.createdAt.toISOString().slice(0, 10)
    const bucket = byDay.get(key)
    if (bucket) bucket.leads += 1
  }

  const sources = new Map<string, number>()
  for (const lead of leads) sources.set(lead.source, (sources.get(lead.source) ?? 0) + 1)

  return {
    company: {
      id: company.id,
      name: company.name,
      verificationStatus: company.verificationStatus,
      badges: parseJson<string[]>(company.badges, []),
      createdAt: company.createdAt,
      responseTimeMins: company.responseTimeMins,
      followers: company._count.followers,
    },
    totals: {
      views: publications.reduce((sum, p) => sum + p.viewCount, 0),
      leads: publications.reduce((sum, p) => sum + p.leadCount, 0),
      favorites: publications.reduce((sum, p) => sum + p.favoriteCount, 0),
      whatsappClicks: countType(EVENT_TYPES.whatsapp),
      emailClicks: countType(EVENT_TYPES.email),
      chatsStarted: countType(EVENT_TYPES.chat),
      followers: company._count.followers,
    },
    publications: {
      active: publications.filter((p) => p.status === 'active').length,
      sold: publications.filter((p) => p.status === 'sold').length,
      expired: publications.filter((p) => p.status === 'expired').length,
      withdrawn: publications.filter((p) => p.status === 'withdrawn').length,
      total: publications.length,
    },
    subscription: subscription
      ? {
          planName: subscription.plan.name,
          status: subscription.status,
          quotaUsed: subscription.quotaUsed,
          quotaTotal: subscription.plan.publicationQuota,
          expiresAt: subscription.expiresAt,
          autoRenew: subscription.autoRenew,
        }
      : null,
    trend: [...byDay.entries()].map(([date, value]) => ({ date, ...value })),
    leadsBySource: [...sources.entries()].map(([source, count]) => ({ source, count })),
  }
}

export type PublicationPerformance = {
  id: string
  slug: string
  title: string
  status: string
  price: number
  currency: string
  photo: string | null
  completeness: number
  publishedAt: Date
  expiresAt: Date
  daysActive: number
  daysToExpiry: number
  views: number
  favorites: number
  leads: number
  whatsappClicks: number
  emailClicks: number
  chatsStarted: number
  hoursToFirstContact: number | null
  conversionRate: number
}

export async function getPublicationPerformance(companyId: string): Promise<PublicationPerformance[]> {
  const publications = await db.publication.findMany({
    where: { companyId },
    orderBy: [{ status: 'asc' }, { publishedAt: 'desc' }],
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      price: true,
      currency: true,
      photos: true,
      completeness: true,
      publishedAt: true,
      expiresAt: true,
      firstContactAt: true,
      viewCount: true,
      favoriteCount: true,
      leadCount: true,
      events: { select: { type: true } },
    },
  })

  return publications.map((pub) => {
    const count = (type: string) => pub.events.filter((e) => e.type === type).length
    const daysActive = Math.max(1, Math.floor((Date.now() - pub.publishedAt.getTime()) / 86400000))

    return {
      id: pub.id,
      slug: pub.slug,
      title: pub.title,
      status: pub.status,
      price: pub.price,
      currency: pub.currency,
      photo: parseJson<string[]>(pub.photos, [])[0] ?? null,
      completeness: pub.completeness,
      publishedAt: pub.publishedAt,
      expiresAt: pub.expiresAt,
      daysActive,
      daysToExpiry: Math.ceil((pub.expiresAt.getTime() - Date.now()) / 86400000),
      views: pub.viewCount,
      favorites: pub.favoriteCount,
      leads: pub.leadCount,
      whatsappClicks: count(EVENT_TYPES.whatsapp),
      emailClicks: count(EVENT_TYPES.email),
      chatsStarted: count(EVENT_TYPES.chat),
      hoursToFirstContact: pub.firstContactAt
        ? Math.round((pub.firstContactAt.getTime() - pub.publishedAt.getTime()) / 3600000)
        : null,
      conversionRate: pub.viewCount ? Number(((pub.leadCount / pub.viewCount) * 100).toFixed(1)) : 0,
    }
  })
}

export async function getCompanyLeads(companyId: string, limit = 50) {
  const where = { publication: { companyId } }

  const [items, total, unread] = await Promise.all([
    db.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        source: true,
        name: true,
        email: true,
        phone: true,
        message: true,
        readAt: true,
        createdAt: true,
        publication: { select: { id: true, slug: true, title: true } },
      },
    }),
    db.lead.count({ where }),
    db.lead.count({ where: { ...where, readAt: null } }),
  ])

  return { items, total, unread }
}

export async function getDefaultCompany() {
  return db.company.findFirst({
    where: { verificationStatus: 'approved' },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  })
}

// La empresa del panel es la del usuario en sesion. Un administrador sin
// empresa propia ve la primera, para poder revisar el panel del vendedor.
export async function getViewerCompany() {
  const user = await getSessionUser()
  if (!user) return null
  if (user.companyId) return { id: user.companyId }
  if (user.role === 'admin') return getDefaultCompany()
  return null
}

export async function getCompanyBilling(companyId: string) {
  const [payments, subscription] = await Promise.all([
    db.payment.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        concept: true,
        amountNet: true,
        taxAmount: true,
        amountTotal: true,
        currency: true,
        method: true,
        status: true,
        invoiceNumber: true,
        paidAt: true,
        createdAt: true,
      },
    }),
    db.subscription.findFirst({
      where: { companyId, status: 'active' },
      orderBy: { startedAt: 'desc' },
      select: {
        id: true,
        status: true,
        quotaUsed: true,
        autoRenew: true,
        startedAt: true,
        expiresAt: true,
        plan: { select: { name: true, price: true, publicationQuota: true, featuredQuota: true } },
      },
    }),
  ])

  return { payments, subscription, taxLabel: env.tax.label }
}
