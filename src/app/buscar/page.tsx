import { Suspense } from 'react'
import type { Metadata } from 'next'
import { searchPublications, getCategories, getFilterOptions } from '@/server/publications'
import { SearchResults } from '@/components/search-results'
import { SearchFilters } from '@/components/search-filters'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Buscar activos' }

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function one(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value || undefined
}

function numeric(value: string | string[] | undefined): number | undefined {
  const raw = one(value)
  if (raw === undefined) return undefined
  const parsed = Number(raw)
  return Number.isNaN(parsed) ? undefined : parsed
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams

  const query = {
    q: one(params.q),
    category: one(params.category),
    city: one(params.city),
    condition: one(params.condition),
    minPrice: numeric(params.minPrice),
    maxPrice: numeric(params.maxPrice),
    minYear: numeric(params.minYear),
    sort: one(params.sort),
    page: numeric(params.page) ?? 1,
  }

  const [result, categories, options] = await Promise.all([
    searchPublications(query),
    getCategories(),
    getFilterOptions(),
  ])

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <Suspense fallback={null}>
        <SearchFilters categories={categories} cities={options.cities} conditions={options.conditions} />
      </Suspense>

      <Suspense fallback={null}>
        <SearchResults
          items={result.items}
          total={result.total}
          page={result.page}
          totalPages={result.totalPages}
          pageSize={result.pageSize}
          query={query.q ?? ''}
        />
      </Suspense>
    </div>
  )
}
