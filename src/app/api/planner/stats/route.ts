import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';
import { getAuthSession } from '../../../../../lib/server-auth';

export async function GET(req: NextRequest) {
  try {
    console.log('📊 درخواست آمار...');
    
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      console.log('❌ کاربر لاگین نیست');
      return NextResponse.json(
        { success: false, message: 'لطفاً وارد شوید' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log('👤 کاربر:', userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // --- فیکس خودکار پیشرفت امروز ---
    let dailyActivity = await prisma.dailyActivity.findUnique({
      where: {
        userId_date: {
          userId: userId,
          date: today
        }
      }
    });

    if (dailyActivity) {
      // محاسبه پیشرفت واقعی
      const completedCount = [
        dailyActivity.videoWatched,
        dailyActivity.podcastListened,
        dailyActivity.wordsReviewed,
        dailyActivity.articleRead
      ].filter(Boolean).length;

      const correctProgress = Math.min(100, (completedCount / 4) * 100);
      
      // اگر progress اشتباه است، آپدیت کن
      if (dailyActivity.progress !== correctProgress) {
        console.log(`🔧 فیکس خودکار: ${dailyActivity.progress}% -> ${correctProgress}%`);
        
        await prisma.dailyActivity.update({
          where: { id: dailyActivity.id },
          data: { progress: correctProgress }
        });
        
        dailyActivity = await prisma.dailyActivity.findUnique({
          where: { id: dailyActivity.id }
        });
      }
    }

    // --- دریافت فعالیت‌های 30 روز اخیر ---
    const activities = await prisma.activityTracking.groupBy({
      by: ['activityType'],
      where: {
        userId: userId,
        createdAt: { gte: thirtyDaysAgo }
      },
      _sum: { duration: true },
      _count: true
    });

    // --- دریافت DailyActivity های 30 روز اخیر ---
    const dailyActivities = await prisma.dailyActivity.findMany({
      where: {
        userId: userId,
        date: { gte: thirtyDaysAgo }
      },
      orderBy: { date: 'desc' }
    });

    // --- دریافت فعالیت امروز ---
    const todayActivity = dailyActivities.find(da => 
      da.date.getDate() === today.getDate() &&
      da.date.getMonth() === today.getMonth() &&
      da.date.getFullYear() === today.getFullYear()
    );

    // --- محاسبه آمار ---
    const totalActivities = {
      videos: activities.find(a => a.activityType === 'video')?._count || 0,
      podcasts: activities.find(a => a.activityType === 'podcast')?._count || 0,
      articles: activities.find(a => a.activityType === 'article')?._count || 0,
      words: activities.find(a => a.activityType === 'words')?._count || 0
    };

    const totalTime = activities.reduce((sum, act) => sum + (act._sum?.duration || 0), 0);

    // میانگین هفتگی
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastWeekActivities = dailyActivities.filter(da => 
      new Date(da.date) >= lastWeek
    );
    
    const weeklyAverage = lastWeekActivities.length > 0 
      ? lastWeekActivities.reduce((sum, da) => sum + da.progress, 0) / lastWeekActivities.length
      : 0;

    // --- محاسبه استریک ---
    let streak = 0;
    let currentDate = new Date(today);
    
    // روزها را به ترتیب مرتب کن
    const sortedActivities = [...dailyActivities].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    for (let i = 0; i < 30; i++) {
      const activityDate = new Date(currentDate);
      const dayActivity = sortedActivities.find(da => {
        const daDate = new Date(da.date);
        daDate.setHours(0, 0, 0, 0);
        return daDate.getTime() === activityDate.getTime();
      });
      
      if (dayActivity && dayActivity.progress > 0) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    // --- ساخت پاسخ ---
    return NextResponse.json({
      success: true,
      data: {
        totalActivities,
        totalTime,
        weeklyAverage,
        todaysProgress: todayActivity?.progress || 0,
        streak,
        recentDays: dailyActivities.slice(0, 7).map(da => ({
          date: da.date,
          progress: da.progress
        }))
      }
    });

  } catch (error) {
    console.error('❌ خطا در دریافت آمار:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطا در دریافت آمار'
      },
      { status: 500 }
    );
  }
}