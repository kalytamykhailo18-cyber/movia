import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { CategoryGrid } from '@/components/category-grid'
import { AnimatedSection } from '@/components/animated-section'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Categorias' }

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    where: { active: true },
    orderBy: { position: 'asc' },
    select: {
      id: true,
      slug: true,
      name: true,
      icon: true,
      _count: { select: { publications: { where: { status: 'active' } } } },
      attributes: { orderBy: { position: 'asc' }, select: { id: true, label: true, unit: true } },
    },
  })

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-[32px] font-bold text-[var(--color-navy)]">Categorias</h1>
        <p className="mt-2 text-[16px] text-[var(--color-text-muted)]">
          Cada categoria tiene sus propios campos tecnicos para que encuentres exactamente lo que
          buscas.
        </p>
      </header>

      <CategoryGrid categories={categories} />

      <AnimatedSection>
        <h2 className="mb-4 text-[24px] font-semibold text-[var(--color-navy)]">
          Que puedes filtrar en cada una
        </h2>
        <div className="grid gap-4 sm:grid-cols-2" data-testid="category-specs">
          {categories.map((cat) => (
            <section
              key={cat.id}
              className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-[16px] font-semibold text-[var(--color-navy)]">{cat.name}</h3>
                <span className="text-[12px] text-[var(--color-text-muted)]">
                  {cat._count.publications} activos
                </span>
              </div>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {cat.attributes.map((attr) => (
                  <li
                    key={attr.id}
                    className="rounded-full bg-[var(--color-primary-soft)] px-2.5 py-1 text-[12px] text-[var(--color-primary)]"
                  >
                    {attr.label}
                    {attr.unit ? ` (${attr.unit})` : ''}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </AnimatedSection>
    </div>
  )
}
