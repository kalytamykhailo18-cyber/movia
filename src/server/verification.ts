import { env } from '@/lib/env'
import { isValidNit, nitCheckDigit } from '@/lib/nit'

export type VerificationOutcome = {
  status: 'approved' | 'rejected' | 'review'
  reason: string
  evidence: Record<string, unknown>
}

type RuesRecord = {
  found: boolean
  active?: boolean
  legalName?: string
}

async function lookupRues(nit: string): Promise<RuesRecord | null> {
  if (!env.verification.ruesApiUrl) return null

  try {
    const url = new URL(env.verification.ruesApiUrl)
    url.searchParams.set('nit', nit)

    const res = await fetch(url, {
      headers: env.verification.ruesApiKey
        ? { Authorization: `Bearer ${env.verification.ruesApiKey}` }
        : undefined,
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) return null
    const body = (await res.json()) as RuesRecord
    return body
  } catch {
    return null
  }
}

export async function verifyCompany(input: {
  nit: string
  checkDigit: string
  legalName: string
}): Promise<VerificationOutcome> {
  const digits = input.nit.replace(/\D/g, '')

  if (!isValidNit(digits, input.checkDigit)) {
    return {
      status: 'rejected',
      reason: `El digito de verificacion no corresponde al NIT. Para ${digits} deberia ser ${nitCheckDigit(digits)}.`,
      evidence: { source: 'checkDigit', nit: digits, provided: input.checkDigit },
    }
  }

  const rues = await lookupRues(digits)

  if (!rues) {
    return {
      status: env.verification.autoApprove ? 'approved' : 'review',
      reason: env.verification.autoApprove
        ? 'NIT valido. Aprobacion automatica activada.'
        : 'NIT valido. Queda pendiente de revision manual porque no hay consulta a RUES configurada.',
      evidence: { source: 'checkDigit', nit: digits, ruesConfigured: false },
    }
  }

  if (!rues.found) {
    return {
      status: 'review',
      reason: 'El NIT no aparece en RUES. Requiere revision manual.',
      evidence: { source: 'RUES', nit: digits, found: false },
    }
  }

  if (rues.active === false) {
    return {
      status: 'review',
      reason: 'La empresa figura inactiva en RUES. Requiere revision manual.',
      evidence: { source: 'RUES', nit: digits, found: true, active: false },
    }
  }

  return {
    status: 'approved',
    reason: 'NIT valido y empresa activa en RUES.',
    evidence: {
      source: 'RUES',
      nit: digits,
      found: true,
      active: true,
      legalName: rues.legalName ?? input.legalName,
      checkedAt: new Date().toISOString(),
    },
  }
}

export const VERIFICATION_STATUS_DB: Record<VerificationOutcome['status'], string> = {
  approved: 'approved',
  rejected: 'rejected',
  review: 'pending',
}
