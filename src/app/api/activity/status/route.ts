import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';
import { getAuthSession } from '../../../../../lib/server-auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'لطفاً وارد شوید' },
        { status: 401 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // دریافت DailyActivity امروز
    const dailyActivity = await prisma.dailyActivity.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today
        }
      }
    });

    // دریافت فعالیت‌های امروز
    const todayActivities = await prisma.activityTracking.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: today
        }
      },
      distinct: ['activityType'],
      select: {
        activityType: true,
        isRegistered: true
      }
    });

    // ساخت پاسخ
    const status = {
      video: {
        processed: dailyActivity?.videoWatched || false,
        hasActivities: todayActivities.some(a => a.activityType === 'video'),
        isRegistered: todayActivities.find(a => a.activityType === 'video')?.isRegistered || false
      },
      podcast: {
        processed: dailyActivity?.podcastListened || false,
        hasActivities: todayActivities.some(a => a.activityType === 'podcast'),
        isRegistered: todayActivities.find(a => a.activityType === 'podcast')?.isRegistered || false
      },
      words: {
        processed: dailyActivity?.wordsReviewed || false,
        hasActivities: todayActivities.some(a => a.activityType === 'words'),
        isRegistered: todayActivities.find(a => a.activityType === 'words')?.isRegistered || false
      },
      article: {
        processed: dailyActivity?.articleRead || false,
        hasActivities: todayActivities.some(a => a.activityType === 'article'),
        isRegistered: todayActivities.find(a => a.activityType === 'article')?.isRegistered || false
      },
      overall: {
        progress: dailyActivity?.progress || 0,
        date: today.toISOString()
      }
    };

    return NextResponse.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Error getting activity status:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت وضعیت' },
      { status: 500 }
    );
  }
}