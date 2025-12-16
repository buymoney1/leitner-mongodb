import { NextRequest, NextResponse } from 'next/server';

import {prisma} from '@/lib/prisma';
import { getAuthSession } from '../../../../../lib/server-auth';

export async function GET(req: NextRequest) {
  try {
    console.log('📅 درخواست فعالیت امروز...');
    
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'لطفاً وارد شوید' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('👤 کاربر:', userId);
    console.log('📅 تاریخ امروز:', today.toLocaleDateString('fa-IR'));

    // --- یافتن یا ایجاد DailyActivity برای امروز ---
    let dailyActivity = await prisma.dailyActivity.findUnique({
      where: {
        userId_date: {
          userId: userId,
          date: today
        }
      },
      include: {
        video: { select: { title: true } },
        podcast: { select: { title: true } },
        article: { select: { title: true } }
      }
    });

    if (!dailyActivity) {
      console.log('🆕 ایجاد DailyActivity جدید');
      dailyActivity = await prisma.dailyActivity.create({
        data: {
          userId: userId,
          date: today,
          progress: 0
        },
        include: {
          video: { select: { title: true } },
          podcast: { select: { title: true } },
          article: { select: { title: true } }
        }
      });
    }

    // --- فیکس خودکار پیشرفت ---
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
      
      // دوباره بگیر با اطلاعات به‌روز شده
      dailyActivity = await prisma.dailyActivity.findUnique({
        where: { id: dailyActivity.id },
        include: {
          video: { select: { title: true } },
          podcast: { select: { title: true } },
          article: { select: { title: true } }
        }
      });
    }



    return NextResponse.json({
      success: true,
      data: dailyActivity
    });

  } catch (error) {
    console.error('❌ خطا در دریافت فعالیت امروز:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطا در دریافت فعالیت امروز'
      },
      { status: 500 }
    );
  }
}