import Link from 'next/link'
import { ArrowRight, BadgeCheck } from 'lucide-react'
import { env } from '@/lib/env'
import { getFeatured, getLatest, getCategories, getVerifiedCompanies } from '@/server/publications'
import { PublicationCard } from '@/components/publication-card'
import { HeroSearch } from '@/components/hero-search'
import { CategoryGrid } from '@/components/category-grid'
import { AnimatedSection } from '@/components/animated-section'
import { parseJson } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [featured, latest, categories, companies] = await Promise.all([
    getFeatured(4),
    getLatest(8),
    getCategories(),
    getVerifiedCompanies(4),
  ])

  return (
    <div className="space-y-12">
      <HeroSearch />

      <AnimatedSection>
        <SectionHeading title="Categorias" href="/categorias" linkLabel="Ver todas" />
        <CategoryGrid categories={categories} />
      </AnimatedSection>

      {featured.length ? (
        <AnimatedSection>
          <SectionHeading title="Activos destacados" href="/buscar?sort=featured" linkLabel="Ver mas" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="featured-grid">
            {featured.map((item, i) => (
              <PublicationCard key={item.id} item={item} index={i} />
            ))}
          </div>
        </AnimatedSection>
      ) : null}

      <AnimatedSection>
        <SectionHeading title="Ultimas publicaciones" href="/buscar" linkLabel="Ver todas" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="latest-grid">
          {latest.map((item, i) => (
            <PublicationCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection>
        <SectionHeading title="Empresas verificadas" href="/empresas" linkLabel="Ver todas" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="companies-grid">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/empresa/${company.id}`}
              className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-[16px] font-semibold text-[var(--color-navy)]">{company.name}</h3>
                <BadgeCheck className="size-5 shrink-0 text-[var(--color-primary)]" aria-hidden />
              </div>
              <p className="mt-1 text-[12px] text-[var(--color-text-muted)]">{company.city?.name}</p>
              <p className="mt-2 line-clamp-2 text-[14px] text-[var(--color-text-muted)]">
                {company.description}
              </p>
              <p className="mt-3 text-[12px] font-medium text-[var(--color-primary)]">
                {company._count.publications} publicaciones activas
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {parseJson<string[]>(company.badges, []).slice(0, 2).map((b) => (
                  <span
                    key={b}
                    className="rounded-full bg-[var(--color-primary-soft)] px-2 py-0.5 text-[11px] text-[var(--color-primary)]"
                  >
                    {b === 'top_seller' ? 'Top seller' : b === 'fast_response' ? 'Respuesta rapida' : 'Verificada'}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </AnimatedSection>

      <AnimatedSection>
        <div className="rounded-[var(--radius-card)] bg-[var(--color-navy)] px-6 py-10 text-center md:px-12">
          <h2 className="text-[28px] font-bold text-white">{env.ui.brandClaim}</h2>
          <p className="mx-auto mt-2 max-w-xl text-[16px] text-white/70">
            Publica los activos que tu empresa ya no usa y conecta con compradores verificados en{' '}
            {env.locale.countryName}.
          </p>
          <Link
            href="/publicar"
            className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-[var(--radius-input)] bg-[var(--color-primary)] px-6 text-[16px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)]"
          >
            Publicar un activo
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </AnimatedSection>
    </div>
  )
}

function SectionHeading({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <h2 className="text-[24px] font-semibold text-[var(--color-navy)] md:text-[28px]">{title}</h2>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-[14px] font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]"
      >
        {linkLabel}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  )
}
