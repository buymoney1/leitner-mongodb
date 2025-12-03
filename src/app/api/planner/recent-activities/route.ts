import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const activities = await prisma.activityTracking.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      include: {
        video: true,
        podcast: true,
        article: true
      }
    });

    return NextResponse.json({
      success: true,
      data: activities
    });

  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت فعالیت‌های اخیر' },
      { status: 500 }
    );
  }
}