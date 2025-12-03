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
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. فعالیت‌های 30 روز اخیر
    const activities = await prisma.activityTracking.groupBy({
      by: ['activityType'],
      where: {
        userId: session.user.id,
        createdAt: { gte: thirtyDaysAgo }
      },
      _sum: {
        duration: true
      },
      _count: true
    });

    // 2. DailyActivity های 30 روز اخیر
    const dailyActivities = await prisma.dailyActivity.findMany({
      where: {
        userId: session.user.id,
        date: { gte: thirtyDaysAgo }
      },
      orderBy: {
        date: 'desc'
      }
    });

    // 3. فعالیت امروز
    const todayActivity = await prisma.dailyActivity.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today
        }
      }
    });

    // 4. محاسبه آمار
    const totalActivities = {
      videos: activities.find(a => a.activityType === 'video')?._count || 0,
      podcasts: activities.find(a => a.activityType === 'podcast')?._count || 0,
      articles: activities.find(a => a.activityType === 'article')?._count || 0,
      words: activities.find(a => a.activityType === 'words')?._count || 0
    };

    const totalTime = activities.reduce((sum, act) => sum + (act._sum?.duration || 0), 0);

    // میانگین هفتگی
    const lastWeekActivities = dailyActivities.filter(da => 
      new Date(da.date).getTime() >= new Date().getTime() - 7 * 24 * 60 * 60 * 1000
    );
    const weeklyAverage = lastWeekActivities.length > 0 
      ? lastWeekActivities.reduce((sum, da) => sum + da.progress, 0) / lastWeekActivities.length
      : 0;

    // محاسبه استریک
    let streak = 0;
    let currentDate = new Date(today);
    
    for (let i = 0; i < 30; i++) {
      const activityDate = new Date(currentDate);
      const dayActivity = dailyActivities.find(da => 
        new Date(da.date).toDateString() === activityDate.toDateString()
      );
      
      if (dayActivity && dayActivity.progress > 0) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalActivities,
        totalTime,
        weeklyAverage,
        todaysProgress: todayActivity?.progress || 0,
        streak,
        recentDays: dailyActivities.slice(0, 7)
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت آمار' },
      { status: 500 }
    );
  }
}