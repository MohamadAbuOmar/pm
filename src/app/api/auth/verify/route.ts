import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken, getUserPermissions, verifyToken, generateToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const permissions = await getUserPermissions(user.id);
    const isAdmin = permissions.includes('manage_roles') && 
                   permissions.includes('manage_permissions') &&
                   permissions.includes('create_user');

    // Check if token needs renewal
    const payload = verifyToken(token);
    if (!payload.exp) {
      throw new Error('Token missing expiration');
    }

    const tokenExp = payload.exp * 1000;
    const now = Date.now();
    const timeUntilExp = tokenExp - now;
    const TOKEN_RENEWAL_THRESHOLD = 24 * 60 * 60 * 1000; // 1 day

    let newToken = null;
    if (timeUntilExp < TOKEN_RENEWAL_THRESHOLD) {
      newToken = generateToken({
        id: user.id,
        email: user.email
      });
    }

    const response = NextResponse.json({ 
      isAdmin,
      permissions,
      newToken 
    });

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
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
