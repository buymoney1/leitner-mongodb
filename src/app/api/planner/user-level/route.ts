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

    // 1. دریافت فعالیت‌های تکمیل شده کاربر
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const completedActivities = await prisma.dailyActivity.count({
      where: {
        userId,
        progress: { gte: 100 } // فعالیت‌های 100% تکمیل شده
      }
    });

    // 2. محاسبه سطح فعلی (هر 10 فعالیت = 1 لول)
    const baseLevel = Math.floor(completedActivities / 10) + 1;
    const currentLevel = Math.min(baseLevel, 15); // حداکثر 15 لول

    // 3. محاسبه فعالیت‌های باقی‌مانده برای لول فعلی
    const activitiesForCurrentLevel = completedActivities % 10;
    const tasksCompleted = activitiesForCurrentLevel;
    const tasksRequired = 10; // هر لول 10 فعالیت نیاز دارد

    // 4. دریافت فعالیت‌های امروز
    const todaysActivity = await prisma.dailyActivity.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        currentLevel,
        tasksCompleted,
        tasksRequired,
        completedActivities,
        todaysProgress: todaysActivity?.progress || 0,
        todaysActivity: todaysActivity ? {
          videoWatched: todaysActivity.videoWatched,
          podcastListened: todaysActivity.podcastListened,
          wordsReviewed: todaysActivity.wordsReviewed,
          articleRead: todaysActivity.articleRead,
          songListened: todaysActivity.songListened
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