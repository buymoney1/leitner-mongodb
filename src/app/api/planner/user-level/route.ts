// app/api/planner/user-level/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '../../../../../lib/server-auth';


interface RouteParams {
  params: Promise<any>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getAuthSession();

    if (!session || !session.user) {
      return NextResponse.json({ 
        error: 'لطفاً وارد حساب کاربری خود شوید' 
      }, { status: 401 });
    }

    // await کردن params (برای Next.js 15)
    await params;

    const userId = session.user.id;

    // دریافت تمام perfectDays کاربر (روزهای با progress = 100)
    const perfectDays = await prisma.dailyActivity.count({
      where: {
        userId,
        progress: 100 // فقط روزهای کامل
      }
    });

    // محاسبه سطح فعلی: هر perfectDay = 1 لول
    const currentLevel = perfectDays + 1; // لول از 1 شروع می‌شود

    // دریافت فعالیت‌های امروز برای محاسبه پیشرفت روز جاری
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysActivity = await prisma.dailyActivity.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    // محاسبه تعداد فعالیت‌های امروز (از 4 فعالیت)
    const todaysCompletedActivities = todaysActivity ? 
      [
        todaysActivity.videoWatched,
        todaysActivity.podcastListened,
        todaysActivity.wordsReviewed,
        todaysActivity.articleRead
      ].filter(Boolean).length : 0;

    return NextResponse.json({
      success: true,
      data: {
        currentLevel,
        perfectDays,
        tasksCompleted: todaysCompletedActivities, // فعالیت‌های امروز
        tasksRequired: 4, // 4 فعالیت روزانه
        todaysProgress: todaysActivity?.progress || 0,
        todaysActivity: todaysActivity ? {
          videoWatched: todaysActivity.videoWatched,
          podcastListened: todaysActivity.podcastListened,
          wordsReviewed: todaysActivity.wordsReviewed,
          articleRead: todaysActivity.articleRead
        } : null
      }
    });

  } catch (error) {
    console.error('Error fetching user level:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات سطح کاربر' },
      { status: 500 }
    );
  }
}