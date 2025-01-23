import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from '@/i18n.config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
});

const PUBLIC_PATHS = [
  '/auth/login',
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/verify'
];

const ADMIN_PATHS = [
  '/admin',
  '/api/admin'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth API endpoints
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Handle i18n for non-API routes
  if (!pathname.startsWith('/api/')) {
    const response = intlMiddleware(request);

    // Allow public paths without auth
    const isPublicPath = PUBLIC_PATHS.some(path => 
      pathname === path || 
      locales.some(locale => pathname === `/${locale}${path}`)
    );

    if (isPublicPath) {
      return response;
    }

    // Check for auth token
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      const locale = request.cookies.get("NEXT_LOCALE")?.value || defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
    }

    // Verify token through API
    try {
      const verifyResponse = await fetch(new URL('/api/auth/verify', request.url), {
        headers: { 'Cookie': `auth-token=${token}` }
      });

      if (!verifyResponse.ok) {
        const locale = request.cookies.get("NEXT_LOCALE")?.value || defaultLocale;
        return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
      }

      const { isAdmin } = await verifyResponse.json();

      // Protect admin routes
      if (pathname.includes('/admin') && !isAdmin) {
        const locale = request.cookies.get("NEXT_LOCALE")?.value || defaultLocale;
        return NextResponse.redirect(new URL(`/${locale}`, request.url));
      }

      return response;
    } catch (err) {
      console.error('Auth verification error:', err);
      const locale = request.cookies.get("NEXT_LOCALE")?.value || defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/api/:path*'
  ]
};
