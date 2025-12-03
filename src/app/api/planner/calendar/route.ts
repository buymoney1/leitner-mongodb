import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {prisma} from '@/lib/prisma';
import { toGregorian } from 'jalaali-js';

export async function GET(req: NextRequest) {
  try {
    console.log('📅 درخواست تقویم دریافت شد');
    
    const session = await auth();
    
    if (!session?.user?.id) {
      console.log('❌ کاربر لاگین نیست');
      return NextResponse.json(
        { success: false, message: 'لطفاً وارد شوید' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log('👤 کاربر ID:', userId);

    const { searchParams } = new URL(req.url);
    const year = parseInt(searchParams.get('year') || '1403');
    const month = parseInt(searchParams.get('month') || '1');

    console.log('📆 سال و ماه درخواستی:', year, month);

    // محاسبه محدوده تاریخ شمسی
    const startGregorian = toGregorian(year, month, 1);
    const endGregorian = toGregorian(year, month, 31);

    const startDate = new Date(startGregorian.gy, startGregorian.gm - 1, startGregorian.gd);
    const endDate = new Date(endGregorian.gy, endGregorian.gm - 1, endGregorian.gd);

    console.log('📅 محدوده تاریخ:', {
      start: startDate.toLocaleDateString('fa-IR'),
      end: endDate.toLocaleDateString('fa-IR')
    });

    // دریافت فعالیت‌های روزانه برای این ماه
    const dailyActivities = await prisma.dailyActivity.findMany({
      where: {
        userId: userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    console.log('📊 تعداد DailyActivities:', dailyActivities.length);
    console.log('📋 DailyActivities:', dailyActivities.map(da => ({
      date: da.date.toLocaleDateString('fa-IR'),
      progress: da.progress,
      video: da.videoWatched,
      podcast: da.podcastListened,
      words: da.wordsReviewed,
      article: da.articleRead
    })));

    // ساخت داده‌های تقویم
    const calendarData = dailyActivities.map(activity => ({
      date: activity.date.toISOString(),
      progress: activity.progress,
      activities: {
        video: activity.videoWatched,
        podcast: activity.podcastListened,
        words: activity.wordsReviewed,
        article: activity.articleRead
      },
      details: activity
    }));

    console.log('📅 داده‌های تقویم:', calendarData);

    // محاسبه آمار ماهانه
    const monthStats = {
      totalDays: dailyActivities.length,
      activeDays: dailyActivities.filter(da => da.progress > 0).length,
      perfectDays: dailyActivities.filter(da => da.progress === 100).length,
      averageProgress: dailyActivities.length > 0 
        ? dailyActivities.reduce((sum, da) => sum + da.progress, 0) / dailyActivities.length
        : 0,
      totalVideos: dailyActivities.filter(da => da.videoWatched).length,
      totalPodcasts: dailyActivities.filter(da => da.podcastListened).length,
      totalArticles: dailyActivities.filter(da => da.articleRead).length,
      totalWords: dailyActivities.filter(da => da.wordsReviewed).length
    };

    console.log('📈 آمار ماهانه:', monthStats);

    return NextResponse.json({
      success: true,
      data: {
        calendar: calendarData,
        stats: monthStats,
        dailyActivities: dailyActivities
      }
    });

  } catch (error) {
    console.error('❌ خطا در دریافت داده‌های تقویم:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطا در دریافت داده‌های تقویم',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}