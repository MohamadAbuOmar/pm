import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserFromToken, getUserPermissions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Check if requester is admin
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const admin = await getUserFromToken(token);
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin permissions
    const permissions = await getUserPermissions(admin.id);
    if (!permissions.includes('create_user')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { email, password } = await request.json();
    
    const user = await createUser(email, password);
    
    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
