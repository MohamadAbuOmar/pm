import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserFromToken, getUserPermissions, generateToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  console.log('Registration attempt started...');
  
  try {
    // Parse request body
    const { email, password } = await request.json();
    console.log('Email received:', email);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log('Email already exists');
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // Check if this is the first user
    const userCount = await prisma.user.count();
    console.log('Current user count:', userCount);
    const isFirstUser = userCount === 0;

    // For non-first users, verify admin permissions
    if (!isFirstUser) {
      const token = request.cookies.get('auth-token')?.value;
      if (!token) {
        console.log('No auth token provided');
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      const admin = await getUserFromToken(token);
      if (!admin) {
        console.log('Invalid token');
        return NextResponse.json(
          { error: 'Invalid authentication' },
          { status: 401 }
        );
      }

      const permissions = await getUserPermissions(admin.id);
      if (!permissions.includes('create_user')) {
        console.log('Insufficient permissions');
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    // Create the user
    console.log('Creating user with isAdmin:', isFirstUser);
    const user = await createUser(email, password, isFirstUser);
    console.log('User created successfully:', { id: user.id, email: user.email });

    // Generate authentication token
    const token = generateToken(user);

    // Create success response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        isAdmin: isFirstUser
      }
    });

    // Set authentication cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error instanceof Error && error.message.includes('prisma')) {
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
