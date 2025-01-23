import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken, getUserPermissions } from '../../../../lib/auth';

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

    return NextResponse.json({ 
      isAdmin,
      permissions,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export const dynamic = 'force-dynamic';
