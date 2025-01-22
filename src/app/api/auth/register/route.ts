import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserFromToken, getUserPermissions, generateToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Check if this is the first user (admin)
    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;

    // For subsequent users, check admin authentication
    if (!isFirstUser) {
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
    }

    // Create user with admin role if it's the first user
    const user = await createUser(email, password, isFirstUser);
    
    // Generate token for first user
    const token = generateToken(user);
    
    // Create response with user data
    const response = NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        isAdmin: isFirstUser
      }
    });

    // Always set auth token cookie for the newly created user
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Registration error details:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }
      
      if (error.message.includes('prisma')) {
        return NextResponse.json(
          { error: 'Database error occurred' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
