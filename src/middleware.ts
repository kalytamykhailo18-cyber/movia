import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE = process.env.SESSION_COOKIE_NAME ?? 'movia_session'
const RAW_SECRET = process.env.JWT_SECRET
if (!RAW_SECRET || RAW_SECRET.length < 32) {
  throw new Error('JWT_SECRET debe estar definido y tener al menos 32 caracteres')
}
const SECRET = new TextEncoder().encode(RAW_SECRET)

const PROTECTED = ['/mi-empresa', '/admin', '/publicar']

// Corre antes de renderizar: sin esto el navegador alcanza a pintar la pagina
// privada y despues salta al ingreso, que se ve como un parpadeo.
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  if (!PROTECTED.some((base) => pathname === base || pathname.startsWith(`${base}/`))) {
    return NextResponse.next()
  }

  const token = req.cookies.get(COOKIE)?.value

  if (token) {
    try {
      await jwtVerify(token, SECRET)
      return NextResponse.next()
    } catch {
      // token vencido o alterado: se trata como si no hubiera sesion
    }
  }

  const url = req.nextUrl.clone()
  url.pathname = '/ingresar'
  url.search = ''
  url.searchParams.set('destino', `${pathname}${search}`)

  const res = NextResponse.redirect(url)
  if (token) res.cookies.delete(COOKIE)
  return res
}

export const config = {
  matcher: ['/mi-empresa/:path*', '/admin/:path*', '/publicar/:path*'],
}
