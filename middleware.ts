import { NextRequest, NextResponse } from 'next/server';

const locales = ['he', 'en'];
const defaultLocale = 'he';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the URL already has a locale prefix (e.g. /he or /en)
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Redirect to the default locale (Hebrew)
  return NextResponse.redirect(
    new URL(`/${defaultLocale}${pathname}`, request.url)
  );
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};