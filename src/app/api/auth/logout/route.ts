import { NextRequest, NextResponse } from 'next/server';
export async function POST(_request: NextRequest) {
  try {
    // Clear the auth token cookie
    const response = NextResponse.json({ success: true });
    response.cookies.delete('auth-token');
    
    return response;
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
