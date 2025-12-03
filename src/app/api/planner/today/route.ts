import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activity = await prisma.dailyActivity.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today
        }
      },
      include: {
        video: true,
        podcast: true,
        article: true
      }
    });

    return NextResponse.json({
      success: true,
      data: activity
    });

  } catch (error) {
    console.error('Error fetching today activity:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت فعالیت امروز' },
      { status: 500 }
    );
  }
}