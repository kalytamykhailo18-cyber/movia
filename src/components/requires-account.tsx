import Link from 'next/link'

export function RequiresAccount({
  title,
  description,
  detail,
  testId,
}: {
  title: string
  description: string
  detail: string
  testId: string
}) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[32px] font-bold text-[var(--color-navy)]">{title}</h1>
        <p className="mt-2 text-[16px] text-[var(--color-text-muted)]">{description}</p>
      </header>

      <section
        className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] bg-white p-10 text-center"
        data-testid={testId}
      >
        <p className="mx-auto max-w-lg text-[15px] text-[var(--color-navy)]">{detail}</p>

        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Link
            href="/buscar"
            className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-input)] bg-[var(--color-primary)] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)]"
          >
            Explorar activos
          </Link>
          <Link
            href="/mi-empresa"
            className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--radius-input)] border border-[#D1D5DB] bg-white px-5 text-[14px] font-medium text-[var(--color-navy)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            Ir a Mi Empresa
          </Link>
        </div>
      </section>
    </div>
  )
}
