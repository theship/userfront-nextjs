// app/api/protected-route/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UserfrontClient } from "@userfront/next/server";
import jwt, { JwtPayload } from 'jsonwebtoken';

const userfront = new UserfrontClient({
  tenantId: process.env.NEXT_PUBLIC_USERFRONT_TENANT_ID!,
});

const JWT_PUBLIC_KEY = process.env.USERFRONT_JWT_PUBLIC_KEY!;

interface UserFrontJwtPayload extends JwtPayload {
  userId?: string;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the JWT
    const decoded = jwt.verify(token, JWT_PUBLIC_KEY, { algorithms: ['RS256'] }) as UserFrontJwtPayload;

    if (typeof decoded === 'string' || !decoded.userId) {
      throw new Error('Invalid token payload');
    }

    const userId = decoded.userId;

    // Fetch additional user data if needed
    const userData = await userfront.getUser(userId);

    return NextResponse.json({ userData });
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json({ error: 'Authentication failed', details: error instanceof Error ? error.message : String(error) }, { status: 401 });
  }
}
