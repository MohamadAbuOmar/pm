import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, generateToken } from '@/lib/auth';
import { AUTH_CONFIG } from '@/config/auth.config';

const PUBLIC_PATHS = ['/auth/login', '/api/auth/register', '/api/auth/login', '/api/auth/logout'];
const TOKEN_RENEWAL_THRESHOLD = 24 * 60 * 60; // 1 day in seconds

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and API routes that don't require auth
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path)) || 
      pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Skip middleware for other API routes
  if (pathname.startsWith('/api/')) {
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
    const response = NextResponse.next();

    // Check if token needs renewal (less than 1 day until expiration)
    const tokenExp = (payload as any).exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const timeUntilExp = tokenExp - now;

    if (timeUntilExp < TOKEN_RENEWAL_THRESHOLD * 1000) {
      // Generate new token with minimal required fields
      const newToken = generateToken({
        id: payload.userId,
        email: payload.email
      });

      // Set new token in cookie
      response.cookies.set('auth-token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
    }

    return response;
  } catch (error) {
    // Invalid token, redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
