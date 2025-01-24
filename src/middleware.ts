import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { TokenPayload } from '@/lib/auth';

// Token verification and renewal is handled by /api/auth/verify endpoint

const intlMiddleware = createMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
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
  console.log('Middleware processing path:', pathname);

  // Skip auth API endpoints completely
  if (pathname.startsWith('/api/auth/')) {
    console.log('Skipping auth endpoint:', pathname);
    return NextResponse.next();
  }

  // Handle i18n for non-API routes
  if (!pathname.startsWith('/api/')) {
    return intlMiddleware(request);
  }

  // Allow public paths without auth
  const isPublicPath = PUBLIC_PATHS.some(path => pathname.includes(path));

  if (isPublicPath) {
    console.log('Allowing public path:', pathname);
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    // For API routes, verify token through API endpoint
    if (pathname.startsWith('/api/')) {
      try {
        const verifyResponse = await fetch(new URL('/api/auth/verify', request.url), {
          headers: { 'Cookie': `auth-token=${token}` }
        });

        if (!verifyResponse.ok) {
          return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { isAdmin } = await verifyResponse.json();

        // Check for admin API routes
        if (pathname.startsWith('/api/admin/') && !isAdmin) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.next();
      } catch (err) {
        console.error('API auth verification error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
    }

    // For non-API routes, handle token verification and i18n
    try {
      const verifyResponse = await fetch(new URL('/api/auth/verify', request.url), {
        headers: { 'Cookie': `auth-token=${token}` }
      });

      if (!verifyResponse.ok) {
        const locale = request.cookies.get('NEXT_LOCALE')?.value || 'en';
        return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
      }

      const { isAdmin, newToken } = await verifyResponse.json();

      // Check for admin routes
      const isAdminPath = ADMIN_PATHS.some(path => pathname.includes(path));
      if (isAdminPath && !isAdmin) {
        const locale = request.cookies.get('NEXT_LOCALE')?.value || 'en';
        return NextResponse.redirect(new URL(`/${locale}`, request.url));
      }

      // Apply i18n middleware and handle response
      const response = intlMiddleware(request);

      // Set new token if provided
      if (newToken) {
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
      console.error('Token validation error:', err);
      const locale = request.cookies.get('NEXT_LOCALE')?.value || 'en';
      return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
    }

    return response;
  } catch (err) {
    console.error('Token validation error:', err);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next|_vercel|.*\\..*).*)',
    '/api/:path*'
  ],
};
