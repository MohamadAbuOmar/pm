import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, generateToken } from '@/lib/auth';
import type { TokenPayload } from '@/lib/auth';

const locales = ['en', 'ar'];

// Create i18n middleware
const i18nMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always'
});

// Public paths that don't require authentication
const publicPaths = [
  '/auth/login',
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/verify'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = request.cookies.get('NEXT_LOCALE')?.value || 'en';

  // Skip auth for API routes
  if (pathname.startsWith('/api/')) {
    // Allow public API routes
    if (pathname.startsWith('/api/auth/')) {
      return NextResponse.next();
    }

    // Check auth token for protected API routes
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      // Verify token and check admin status for admin routes
      const verifyResponse = await fetch(new URL('/api/auth/verify', request.url), {
        headers: { 'Cookie': `auth-token=${token}` }
      });

      if (!verifyResponse.ok) {
        throw new Error('Invalid token');
      }

      const { isAdmin } = await verifyResponse.json();

      // Check admin API routes
      if (pathname.includes('/api/admin') && !isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Handle token renewal
      const payload = verifyToken(token) as TokenPayload;
      const tokenExp = payload.exp ? payload.exp * 1000 : 0;
      const now = Date.now();
      const timeUntilExp = tokenExp - now;

      const response = NextResponse.next();

      if (timeUntilExp < 24 * 60 * 60 * 1000) { // 1 day
        const newToken = generateToken({
          id: payload.userId,
          email: payload.email
        });

        response.cookies.set('auth-token', newToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60,
          path: '/',
        });
      }

      return response;
    } catch (err) {
      console.error('Auth error:', err);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Handle i18n for non-API routes
  const i18nResponse = await i18nMiddleware(request);
  
  // If i18n middleware redirected, return that response
  if (i18nResponse.headers.get('Location')) {
    return i18nResponse;
  }

  // Check if path is public (after locale prefix)
  const pathWithoutLocale = pathname.replace(new RegExp(`^/(${locales.join('|')})`), '');
  const isPublicPath = publicPaths.some(path => pathWithoutLocale === path);
  
  if (isPublicPath) {
    return i18nResponse;
  }

  // Check auth token for protected routes
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
  }

  try {
    // Verify token and check admin status
    const verifyResponse = await fetch(new URL('/api/auth/verify', request.url), {
      headers: { 'Cookie': `auth-token=${token}` }
    });

    if (!verifyResponse.ok) {
      throw new Error('Invalid token');
    }

    const { isAdmin } = await verifyResponse.json();

    // Check admin routes
    if (pathWithoutLocale.startsWith('/admin') && !isAdmin) {
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }

    // Handle token renewal
    const payload = verifyToken(token) as TokenPayload;
    const tokenExp = payload.exp ? payload.exp * 1000 : 0;
    const now = Date.now();
    const timeUntilExp = tokenExp - now;

    const response = i18nResponse;

    if (timeUntilExp < 24 * 60 * 60 * 1000) { // 1 day
      const newToken = generateToken({
        id: payload.userId,
        email: payload.email
      });

      response.cookies.set('auth-token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });
    }

    return response;
  } catch (err) {
    console.error('Auth error:', err);
    return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next|_vercel|.*\\..*).*)',
    '/api/:path*'
  ]
};
