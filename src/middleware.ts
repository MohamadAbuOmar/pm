import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, generateToken, getUserFromToken } from '@/lib/auth';

const intlMiddleware = createIntlMiddleware({
  locales: ["en", "ar"],
  defaultLocale: "en",
});

const PUBLIC_PATHS = ['/auth/login', '/api/auth/register', '/api/auth/login', '/api/auth/logout'];
const ADMIN_PATHS = ['/admin'];
const TOKEN_RENEWAL_THRESHOLD = 24 * 60 * 60; // 1 day in seconds

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log('Middleware processing path:', pathname);

  // Skip auth endpoints completely
  if (pathname.startsWith('/api/auth/')) {
    console.log('Skipping auth endpoint:', pathname);
    return NextResponse.next();
  }

  // Handle i18n first
  const pathnameIsMissingLocale = ["en", "ar"].every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = request.cookies.get("NEXT_LOCALE")?.value || "en";
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }

  // Check for admin routes
  if (ADMIN_PATHS.some(path => pathname.includes(path))) {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
      const user = await getUserFromToken(token);
      if (!user) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }

      const response = await fetch(new URL('/api/auth/verify', request.url), {
        headers: {
          'Cookie': `auth-token=${token}`
        }
      });
      
      if (!response.ok) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }

      const { isAdmin } = await response.json();
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // Allow public paths
  if (PUBLIC_PATHS.some(path => pathname.includes(path))) {
    console.log('Allowing public path:', pathname);
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    // Verify token and check expiration
    const payload = verifyToken(token);
    const response = intlMiddleware(request);

    // Check if token needs renewal
    const tokenExp = (payload as { exp: number }).exp * 1000;
    const now = Date.now();
    const timeUntilExp = tokenExp - now;

    if (timeUntilExp < TOKEN_RENEWAL_THRESHOLD * 1000) {
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
    console.error('Token validation error:', err);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
    "/:locale/admin/:path*",
    "/:locale/admin",
    "/admin/:path*",
    "/admin",
  ],
};
