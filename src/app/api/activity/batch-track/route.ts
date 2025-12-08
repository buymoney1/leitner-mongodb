// app/api/activity/batch-track/route.ts
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
    const { activities } = body;

    if (!Array.isArray(activities) || activities.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid activities array' }, { status: 400 });
    }

    const results = [];
    
    for (const activityData of activities) {
      const { activityType, duration, pathname, timestamp } = activityData;
      
      // اعتبارسنجی
      if (!['video', 'podcast', 'words', 'article', 'song'].includes(activityType) || !duration) {
        continue;
      }

      // ذخیره فعالیت
      const activity = await prisma.activityTracking.create({
        data: {
          userId: session.user.id,
          activityType,
          duration,
          pathname,
          isRegistered: false,
          createdAt: timestamp ? new Date(timestamp) : new Date()
        }
      });

      results.push(activity);
    }

    // پردازش DailyActivity (مشابه route قبلی)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayActivities = await prisma.activityTracking.findMany({
      where: {
        userId: session.user.id,
        isRegistered: false,
        createdAt: { gte: today }
      }
    });

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

    // ... (بقیه کد مشابه route قبلی برای پردازش فعالیت‌ها)

    return NextResponse.json({
      success: true,
      data: {
        processed: results.length,
        activities: results
      }
    });

  } catch (error) {
    console.error('❌ خطا در batch track:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}