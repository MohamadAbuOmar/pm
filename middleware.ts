import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const intlMiddleware = createIntlMiddleware({
  locales: ["en", "ar"],
  defaultLocale: "en",
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
  '/en/admin',
  '/ar/admin'
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
    const pathnameIsMissingLocale = ["en", "ar"].every(
      (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    if (pathnameIsMissingLocale) {
      const locale = request.cookies.get("NEXT_LOCALE")?.value || "en";
      return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
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
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    // Verify token and check admin status
    const verifyResponse = await fetch(new URL('/api/auth/verify', request.url), {
      headers: {
        'Cookie': `auth-token=${token}`
      }
    });

    if (!verifyResponse.ok) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    const { isAdmin } = await verifyResponse.json();

    // Check for admin routes
    const isAdminPath = ADMIN_PATHS.some(path => 
      pathname.startsWith(path) || 
      pathname.startsWith(`/en${path}`) || 
      pathname.startsWith(`/ar${path}`)
    );

    if (isAdminPath && !isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Apply i18n middleware for non-API routes
    const response = pathname.startsWith('/api/') 
      ? NextResponse.next()
      : intlMiddleware(request);

    return response;
  } catch (err) {
    console.error('Token validation error:', err);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: [
    "/((?!_next|_vercel|.*\\..*).*)",
    "/api/:path*"
  ],
};
