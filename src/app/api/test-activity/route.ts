import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '../../../../lib/server-auth';


export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  
  return NextResponse.json({
    success: true,
    session: !!session,
    userId: session?.user?.id,
    message: 'Test endpoint'
  });
}