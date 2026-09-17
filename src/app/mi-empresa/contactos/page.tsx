import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Mail, MessageSquare } from 'lucide-react'
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon'
import { getCompanyLeads, getViewerCompany } from '@/server/analytics'
import { AnimatedSection } from '@/components/animated-section'
import { Badge } from '@/components/ui/badge'
import { shortDate } from '@/lib/format'
import { Pagination } from '@/components/ui/pagination'
import { resolvePage } from '@/lib/paginate'
import { env } from '@/lib/env'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Contactos recibidos' }

const SOURCE: Record<string, { label: string; icon: React.ReactNode; tone: 'success' | 'verified' | 'neutral' }> = {
  whatsapp: { label: 'WhatsApp', icon: <WhatsAppIcon className="size-3.5" />, tone: 'success' },
  email: { label: 'Correo', icon: <Mail className="size-3.5" />, tone: 'verified' },
  chat: { label: 'Chat interno', icon: <MessageSquare className="size-3.5" />, tone: 'neutral' },
}

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> }

export default async function LeadsPage({ searchParams }: Props) {
  const query = await searchParams
  const company = await getViewerCompany()
  if (!company) redirect('/ingresar')

  const pagina = resolvePage(query.page, env.search.listPageSize)
  const { items: leads, total, unread, page, totalPages, pageSize } = await getCompanyLeads(
    company.id,
    pagina,
  )

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[28px] font-bold text-[var(--color-navy)]">Contactos recibidos</h1>
        <p className="mt-1 text-[16px] text-[var(--color-text-muted)]">
          <span data-testid="leads-total">{total}</span> contactos registrados
          {unread ? `, ${unread} sin leer` : ''}.
        </p>
      </header>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        label="contactos"
        compact
        testId="pagination-top"
      />

      <AnimatedSection>
        {leads.length ? (
          <ul className="space-y-3" data-testid="leads-list">
            {leads.map((lead) => {
              const source = SOURCE[lead.source] ?? SOURCE.chat
              return (
                <li
                  key={lead.id}
                  className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4"
                  data-testid="lead-item"
                  data-lead-id={lead.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={source.tone} icon={source.icon}>
                          {source.label}
                        </Badge>
                        {!lead.readAt ? <Badge tone="verified">Nuevo</Badge> : null}
                      </div>

                      <p className="mt-2 text-[15px] font-semibold text-[var(--color-navy)]">
                        {lead.name ?? 'Contacto sin nombre'}
                      </p>

                      <p className="text-[13px] text-[var(--color-text-muted)]">
                        {[lead.email, lead.phone].filter(Boolean).join(' · ') || 'Sin datos de contacto'}
                      </p>
                    </div>

                    <span className="text-[12px] text-[var(--color-text-muted)]">
                      {shortDate(lead.createdAt)}
                    </span>
                  </div>

                  {lead.message ? (
                    <p className="mt-3 rounded-[var(--radius-input)] bg-[var(--color-background)] p-3 text-[14px] text-[var(--color-navy)]">
                      {lead.message}
                    </p>
                  ) : null}

                  <Link
                    href={`/publicacion/${lead.publication.slug}`}
                    className="mt-3 inline-block text-[13px] font-medium text-[var(--color-primary)] hover:underline"
                    data-testid="lead-publication"
                  >
                    {lead.publication.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <div
            className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] bg-white p-12 text-center"
            data-testid="leads-empty"
          >
            <p className="text-[16px] font-medium text-[var(--color-navy)]">Aun no recibes contactos</p>
            <p className="mt-1 text-[14px] text-[var(--color-text-muted)]">
              Completa tus publicaciones y agrega fotos para aumentar la visibilidad.
            </p>
          </div>
        )}
      </AnimatedSection>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        label="contactos"
      />
    </div>
  )
}
