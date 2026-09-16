import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { env } from '@/lib/env'
import { hashPassword, createSession } from '@/lib/auth'
import { nitCheckDigit } from '@/lib/nit'
import { verifyCompany, VERIFICATION_STATUS_DB } from '@/server/verification'

const base = {
  email: z.string().email().max(160),
  password: z.string().min(8).max(100),
  fullName: z.string().trim().min(3).max(120),
  phone: z.string().trim().max(40).optional(),
}

const schema = z.discriminatedUnion('accountType', [
  z.object({ accountType: z.literal('natural'), ...base }),
  z.object({
    accountType: z.literal('company'),
    ...base,
    companyName: z.string().trim().min(2).max(160),
    legalName: z.string().trim().min(2).max(200),
    nit: z.string().trim().min(8).max(20),
    checkDigit: z.string().trim().length(1),
    cityId: z.string().optional(),
    chamberOfCommerce: z.string().trim().max(60).optional(),
  }),
])

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Datos invalidos', issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const data = parsed.data
  const email = data.email.toLowerCase()

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } })
  if (existing) {
    return NextResponse.json({ error: 'Ya existe una cuenta con ese correo' }, { status: 409 })
  }

  const country = await db.country.findUnique({
    where: { isoCode: env.locale.countryCode },
    select: { id: true },
  })
  if (!country) {
    return NextResponse.json({ error: 'Pais no configurado' }, { status: 500 })
  }

  const passwordHash = await hashPassword(data.password)

  if (data.accountType === 'natural') {
    const user = await db.user.create({
      data: {
        email,
        passwordHash,
        fullName: data.fullName,
        phone: data.phone ?? null,
        role: 'user',
        accountType: 'natural',
        countryId: country.id,
      },
      select: { id: true },
    })

    await createSession(user.id)
    return NextResponse.json({ ok: true, accountType: 'natural' }, { status: 201 })
  }

  const digits = data.nit.replace(/\D/g, '')

  // Primero se valida el NIT: si el digito no corresponde hay que decirlo,
  // aunque ese NIT ya exista, porque el dato que escribio esta mal.
  const outcome = await verifyCompany({
    nit: digits,
    checkDigit: data.checkDigit,
    legalName: data.legalName,
  })

  if (outcome.status === 'rejected') {
    return NextResponse.json({ error: outcome.reason }, { status: 400 })
  }

  const duplicated = await db.company.findUnique({ where: { nit: digits }, select: { id: true } })
  if (duplicated) {
    return NextResponse.json({ error: 'Ya existe una empresa registrada con ese NIT' }, { status: 409 })
  }

  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      fullName: data.fullName,
      phone: data.phone ?? null,
      role: 'owner',
      accountType: 'company',
      countryId: country.id,
    },
    select: { id: true },
  })

  const company = await db.company.create({
    data: {
      name: data.companyName,
      legalName: data.legalName,
      nit: digits,
      nitCheckDigit: nitCheckDigit(digits),
      chamberOfCommerce: data.chamberOfCommerce ?? null,
      countryId: country.id,
      cityId: data.cityId || null,
      ownerId: user.id,
      verificationStatus: VERIFICATION_STATUS_DB[outcome.status],
      verificationNote: outcome.reason,
      verificationEvidence: JSON.stringify(outcome.evidence),
      verifiedAt: outcome.status === 'approved' ? new Date() : null,
      badges: outcome.status === 'approved' ? JSON.stringify(['verified']) : '[]',
    },
    select: { id: true, verificationStatus: true },
  })

  await db.user.update({ where: { id: user.id }, data: { companyId: company.id } })

  await db.auditLog.create({
    data: {
      actorId: user.id,
      actorEmail: email,
      action: 'company_register',
      entity: 'company',
      entityId: company.id,
      payload: JSON.stringify({ status: company.verificationStatus, reason: outcome.reason }),
    },
  })

  await createSession(user.id)

  return NextResponse.json(
    {
      ok: true,
      accountType: 'company',
      verificationStatus: company.verificationStatus,
      message: outcome.reason,
    },
    { status: 201 },
  )
}
