import createIntlMiddleware from 'next-intl/middleware'
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { routing } from './src/i18n/routing'

// Build the next-intl middleware once at module level (it's stateless)
const intlMiddleware = createIntlMiddleware(routing)

// Routes (without locale prefix) that require a logged-in user
const PROTECTED_PATHS = ['/dashboard', '/admin']

// Routes (without locale prefix) that logged-in users should not visit
const AUTH_PATHS = ['/auth/login', '/auth/register']

export async function middleware(request: NextRequest) {
  // ─── Step 1: Run next-intl first ─────────────────────────────────────────
  // This handles locale detection, default locale redirects (/→/he), and
  // locale-prefixing. We need its response as the base to build on.
  const intlResponse = intlMiddleware(request)

  // If next-intl is redirecting (e.g. / → /he), pass it through immediately.
  // There's no point running Supabase auth on a response that's just a redirect.
  if (intlResponse.status !== 200) {
    return intlResponse
  }

  // ─── Step 2: Create Supabase client attached to this response ────────────
  // Cookie reads come from the incoming request.
  // Cookie writes (session refresh) are applied directly to intlResponse,
  // so we return one coherent response with everything set.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            intlResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // ─── Step 3: Validate the session ────────────────────────────────────────
  // getUser() validates the JWT against Supabase's server.
  // Never use getSession() in middleware — it reads the cookie without
  // validating it, which is a security hole (a tampered cookie would pass).
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ─── Step 4: Route protection ────────────────────────────────────────────
  const pathname = request.nextUrl.pathname

  // Strip the locale prefix to get a normalised path for matching.
  // '/he/dashboard/trips' → '/dashboard/trips'
  const pathWithoutLocale = pathname.replace(/^\/(he|en)/, '') || '/'
  const detectedLocale = (pathname.split('/')[1] as 'he' | 'en') ?? 'he'

  const isProtected = PROTECTED_PATHS.some((p) => pathWithoutLocale.startsWith(p))
  const isAuthPage = AUTH_PATHS.some((p) => pathWithoutLocale.startsWith(p))

  // Unauthenticated user → redirect to login, preserve intended destination
  if (isProtected && !user) {
    const loginUrl = new URL(`/${detectedLocale}/auth/login`, request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated user on login/register → redirect to dashboard
  if (isAuthPage && user) {
    return NextResponse.redirect(
      new URL(`/${detectedLocale}/dashboard`, request.url)
    )
  }

  return intlResponse
}

export const config = {
  // Unchanged from original — excludes Next.js internals and static files
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
}
