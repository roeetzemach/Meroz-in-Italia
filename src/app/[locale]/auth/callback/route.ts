import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Auth callback handler.
 *
 * Supabase redirects here after:
 * - Google OAuth login (contains a `code` query param)
 * - Magic link email click (also contains a `code` query param in PKCE flow)
 * - Email confirmation after registration (same)
 *
 * This route exchanges the temporary code for a real session cookie,
 * then redirects the user to their intended destination.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  // If login was triggered from a protected page, go back there after auth
  const redirectTo = searchParams.get('redirectTo') ?? `/${locale}/dashboard`

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Session established — send the user where they were going
      return NextResponse.redirect(new URL(redirectTo, origin))
    }
  }

  // Something went wrong — send back to login with an error flag
  // The login page reads this flag and shows a message
  return NextResponse.redirect(
    new URL(`/${locale}/auth/login?error=callback_failed`, origin)
  )
}
