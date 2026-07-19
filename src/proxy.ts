import { NextResponse, type NextRequest } from 'next/server'
// Imports './features/auth/session' directly, NEVER the barrel — the barrel
// re-exports './credentials', which pulls in node:crypto and breaks the Edge
// middleware bundle.
import { SESSION_COOKIE_NAME, verifySessionValue } from '#/features/auth/session'

// Deny by default: every route requires a session except /login.
const PUBLIC_PATHS = ['/login']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const session = await verifySessionValue(request.cookies.get(SESSION_COOKIE_NAME)?.value)
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  if (isPublic) {
    // Already signed in? Skip the login form.
    if (session) return NextResponse.redirect(new URL('/dashboard', request.url))
    return NextResponse.next()
  }

  if (!session) return NextResponse.redirect(new URL('/login', request.url))

  return NextResponse.next()
}

export const config = {
  // Everything except Next internals and static assets.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp)$).*)'],
}
