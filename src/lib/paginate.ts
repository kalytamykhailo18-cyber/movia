import { env } from './env'

export type Page = {
  page: number
  pageSize: number
  skip: number
  take: number
}

export function resolvePage(raw: unknown, pageSize = env.search.pageSize): Page {
  const parsed = Number(Array.isArray(raw) ? raw[0] : raw)
  const page = Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1
  const size = Math.min(pageSize, env.search.maxPageSize)

  return { page, pageSize: size, skip: (page - 1) * size, take: size }
}

export function pageMeta(total: number, page: Page) {
  const totalPages = Math.max(1, Math.ceil(total / page.pageSize))
  return {
    total,
    page: Math.min(page.page, totalPages),
    pageSize: page.pageSize,
    totalPages,
  }
}
