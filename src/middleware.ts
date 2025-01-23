import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, generateToken } from '@/lib/auth';
import type { TokenPayload } from '@/lib/auth';

const TOKEN_RENEWAL_THRESHOLD = 24 * 60 * 60 * 1000; // 1 day in milliseconds

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
    const isAdminPath = ADMIN_PATHS.some(path => pathname.includes(path));

    if (isAdminPath && !isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
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
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!_next|_vercel|.*\\..*).*)',
    '/api/:path*'
  ],
};
