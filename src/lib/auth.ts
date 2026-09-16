import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { env } from './env'
import { db } from './db'

export type SessionUser = {
  id: string
  email: string
  fullName: string
  role: string
  accountType: string
  companyId: string | null
}

const secret = new TextEncoder().encode(env.auth.jwtSecret)

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, env.auth.bcryptRounds)
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash)
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(env.auth.jwtExpiresIn)
    .sign(secret)

  const store = await cookies()
  store.set(env.auth.cookieName, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.app.url.startsWith('https'),
    path: '/',
    maxAge: env.auth.cookieMaxAge,
  })
}

export async function destroySession() {
  const store = await cookies()
  store.delete(env.auth.cookieName)
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies()
  const token = store.get(env.auth.cookieName)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secret)
    const userId = payload.sub
    if (!userId) return null

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        accountType: true,
        companyId: true,
        status: true,
      },
    })

    if (!user || user.status !== 'active') return null

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      accountType: user.accountType,
      companyId: user.companyId,
    }
  } catch {
    return null
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  return user
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser()
  if (user.role !== 'admin') throw new Error('FORBIDDEN')
  return user
}
