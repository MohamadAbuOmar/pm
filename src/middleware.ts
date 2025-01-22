import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, generateToken } from '@/lib/auth';
import type { TokenPayload } from '@/lib/auth';

const TOKEN_RENEWAL_THRESHOLD = 24 * 60 * 60 * 1000; // 1 day in milliseconds
const LOCALES = ['en', 'ar'];

const intlMiddleware = createMiddleware({
  locales: LOCALES,
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
    const pathnameIsMissingLocale = LOCALES.every(
      (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    if (pathnameIsMissingLocale) {
      const locale = request.cookies.get("NEXT_LOCALE")?.value || "en";
      // Remove any leading slashes to prevent double slashes
      const cleanPath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
      return NextResponse.redirect(new URL(`/${locale}/${cleanPath}`, request.url));
    }
  }

  // Allow public paths without auth
  const isPublicPath = PUBLIC_PATHS.some(path => 
    pathname === path || 
    pathname === `/en${path}` || 
    pathname === `/ar${path}`
  );

  if (isPublicPath) {
    console.log('Allowing public path:', pathname);
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    const locale = request.cookies.get("NEXT_LOCALE")?.value || "en";
    return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
  }

  try {
    // Verify token and check admin status
    const verifyResponse = await fetch(new URL('/api/auth/verify', request.url), {
      headers: {
        'Cookie': `auth-token=${token}`
      }
    });

    if (!verifyResponse.ok) {
      const locale = request.cookies.get("NEXT_LOCALE")?.value || "en";
      return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
    }

    const { isAdmin } = await verifyResponse.json();

    // Check for admin routes
    const isAdminPath = pathname.includes('/admin');

    if (isAdminPath && !isAdmin) {
      const locale = request.cookies.get("NEXT_LOCALE")?.value || "en";
      return NextResponse.redirect(new URL(`/${locale}`, request.url));
    }

    // Apply i18n middleware for non-API routes
    const response = pathname.startsWith('/api/') 
      ? NextResponse.next()
      : intlMiddleware(request);

    // Check if token needs renewal
    try {
      const payload = verifyToken(token) as TokenPayload;
      if (!payload.exp) {
        throw new Error('Token missing expiration');
      }
      
      const tokenExp = payload.exp * 1000;
      const now = Date.now();
      const timeUntilExp = tokenExp - now;

      if (timeUntilExp < TOKEN_RENEWAL_THRESHOLD) {
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
    } catch (error) {
      console.error('Token renewal error:', error);
    }

    return response;
  } catch (err) {
    console.error('Token validation error:', err);
    const locale = request.cookies.get("NEXT_LOCALE")?.value || "en";
    return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next|_vercel|.*\\..*).*)",
    "/api/:path*"
  ],
};
