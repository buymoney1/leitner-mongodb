// app/api/activity/track/route.ts
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getAuthSession } from '../../../../../lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { activityType, duration, pathname } = body;
    
    console.log('📝 دریافت فعالیت:', { activityType, duration, pathname });

    // اعتبارسنجی
    if (!['video', 'podcast', 'words', 'article', 'song'].includes(activityType)) {
      return NextResponse.json({ success: false, error: 'Invalid activity type' }, { status: 400 });
    }

    if (!duration || duration < 1) {
      return NextResponse.json({ success: false, error: 'Invalid duration' }, { status: 400 });
    }

    // ذخیره فعالیت
    const activity = await prisma.activityTracking.create({
      data: {
        userId: session.user.id,
        activityType,
        duration,
        pathname,
        isRegistered: false
      }
    });

    // پردازش خودکار برای بررسی DailyActivity
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // فعالیت‌های ثبت نشده امروز
    const todayActivities = await prisma.activityTracking.findMany({
      where: {
        userId: session.user.id,
        isRegistered: false,
        createdAt: { gte: today }
      }
    });

    // DailyActivity امروز
    let dailyActivity = await prisma.dailyActivity.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today
        }
      }
    });

    if (!dailyActivity) {
      dailyActivity = await prisma.dailyActivity.create({
        data: {
          userId: session.user.id,
          date: today,
          progress: 0
        }
      });
    }

    // محاسبه کل زمان هر فعالیت
    const activitySummary = todayActivities.reduce((acc, act) => {
      if (!acc[act.activityType]) {
        acc[act.activityType] = { totalDuration: 0, count: 0 };
      }
      acc[act.activityType].totalDuration += act.duration;
      acc[act.activityType].count++;
      return acc;
    }, {} as Record<string, { totalDuration: number; count: number }>);

    // آپدیت DailyActivity
    const updates: any = {};
    const activitiesToMark: string[] = [];

    Object.entries(activitySummary).forEach(([type, { totalDuration }]) => {
      if (totalDuration >= 10) {
        switch (type) {
          case 'video':
            if (!dailyActivity!.videoWatched) {
              updates.videoWatched = true;
              activitiesToMark.push(
                ...todayActivities.filter(a => a.activityType === 'video').map(a => a.id)
              );
            }
            break;
          case 'podcast':
            if (!dailyActivity!.podcastListened) {
              updates.podcastListened = true;
              activitiesToMark.push(
                ...todayActivities.filter(a => a.activityType === 'podcast').map(a => a.id)
              );
            }
            break;
          case 'words':
            if (!dailyActivity!.wordsReviewed) {
              updates.wordsReviewed = true;
              activitiesToMark.push(
                ...todayActivities.filter(a => a.activityType === 'words').map(a => a.id)
              );
            }
            break;
          case 'article':
            if (!dailyActivity!.articleRead) {
              updates.articleRead = true;
              activitiesToMark.push(
                ...todayActivities.filter(a => a.activityType === 'article').map(a => a.id)
              );
            }
            break;
          case 'song':
            if (!dailyActivity!.songListened) {
              updates.songListened = true;
              activitiesToMark.push(
                ...todayActivities.filter(a => a.activityType === 'song').map(a => a.id)
              );
            }
            break;
        }
      }
    });

    // محاسبه پیشرفت
    const currentStatus = {
      video: updates.videoWatched || dailyActivity.videoWatched,
      podcast: updates.podcastListened || dailyActivity.podcastListened,
      words: updates.wordsReviewed || dailyActivity.wordsReviewed,
      article: updates.articleRead || dailyActivity.articleRead,
      song: updates.songListened || dailyActivity.songListened
    };

    const completedCount = Object.values(currentStatus).filter(Boolean).length;
    const totalActivities = 5; // ویدیو، پادکست، لغات، مقاله، آهنگ
    updates.progress = Math.min(100, (completedCount / totalActivities) * 100);

    // آپدیت DailyActivity
    if (Object.keys(updates).length > 0) {
      await prisma.dailyActivity.update({
        where: { id: dailyActivity.id },
        data: updates
      });
    }

    // مارک کردن فعالیت‌های ثبت شده
    if (activitiesToMark.length > 0) {
      await prisma.activityTracking.updateMany({
        where: { id: { in: activitiesToMark } },
        data: {
          isRegistered: true,
          registeredAt: new Date()
        }
      });
    }

    // اگر روز کامل شد
    if (updates.progress === 100 && !dailyActivity.completedAt) {
      await prisma.dailyActivity.update({
        where: { id: dailyActivity.id },
        data: { completedAt: new Date() }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        activity,
        dailyActivity: { ...dailyActivity, ...updates },
        marked: activitiesToMark.length,
        progress: updates.progress || dailyActivity.progress
      }
    });

  } catch (error) {
    console.error('❌ خطا در ثبت فعالیت:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}