import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await auth();
  
  return NextResponse.json({
    success: true,
    session: !!session,
    userId: session?.user?.id,
    message: 'Test endpoint'
  });
}