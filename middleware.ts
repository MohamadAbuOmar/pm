import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, generateToken } from '@/lib/auth';
import type { TokenPayload } from '@/lib/auth';

const locales = ['en', 'ar'];
const publicPaths = ['/auth/login', '/api/auth'];

// Create i18n middleware
const i18nMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always'
});

// Create auth middleware
async function withAuth(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip auth for public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    const locale = request.cookies.get('NEXT_LOCALE')?.value || 'en';
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
    if (pathname.includes('/admin') && !isAdmin) {
      const locale = request.cookies.get('NEXT_LOCALE')?.value || 'en';
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
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
    const locale = request.cookies.get('NEXT_LOCALE')?.value || 'en';
    return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
  }
}

// Combine middlewares
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip i18n for API routes
  if (pathname.startsWith('/api/')) {
    return withAuth(request);
  }

  // Apply i18n middleware first
  const i18nResponse = await i18nMiddleware(request);
  
  // If i18n middleware redirected, return that response
  if (i18nResponse.headers.get('Location')) {
    return i18nResponse;
  }

  // Otherwise, continue with auth
  return withAuth(request);
}

export const config = {
  matcher: [
    '/((?!_next|_vercel|.*\\..*).*)',
    '/api/:path*'
  ]
};
