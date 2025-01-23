import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserFromToken, getUserPermissions, generateToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Verify database connection
    await prisma.$connect();

    // Check if this is the first user (admin)
    const userCount = await prisma.user.count();
    const isFirstUser = userCount === 0;

    console.log('User count:', userCount);
    
    // Allow first user registration without authentication
    if (isFirstUser) {
      console.log('Allowing first user registration without authentication');
    } else {
      // For subsequent users, verify admin authentication
      const token = request.cookies.get('auth-token')?.value;
      if (!token) {
        return NextResponse.json(
          { error: 'Unauthorized - Admin token required' },
          { status: 401 }
        );
      }

      const admin = await getUserFromToken(token);
      if (!admin) {
        return NextResponse.json(
          { error: 'Invalid admin token' },
          { status: 401 }
        );
      }

      // Verify admin has create_user permission
      const permissions = await getUserPermissions(admin.id);
      if (!permissions.includes('create_user')) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    // Create user
    console.log('Creating user with admin role:', isFirstUser);
    const user = await createUser(email, password, isFirstUser);
    
    // Generate authentication token
    const token = generateToken({
      id: user.id,
      email: user.email
    });
    
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
    console.error('Registration error:', {
      type: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    // Handle specific error cases
    if (error instanceof Error) {
      // Database connection error
      if (error.message.includes('connect')) {
        return NextResponse.json(
          { error: 'Database connection failed' },
          { status: 500 }
        );
      }

      // Email uniqueness violation
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }

      // Invalid input data
      if (error.message.includes('validation failed')) {
        return NextResponse.json(
          { error: 'Invalid input data' },
          { status: 400 }
        );
      }

      // Database-related errors
      if (error.message.includes('prisma') || error.message.includes('database')) {
        return NextResponse.json(
          { error: 'Database error occurred' },
          { status: 500 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
