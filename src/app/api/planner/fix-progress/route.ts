import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {prisma} from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    console.log('🔧 شروع فیکس کردن پیشرفت...');
    
    const session = await auth();
    
    if (!session?.user?.id) {
      console.log('❌ کاربر لاگین نیست');
      return NextResponse.json(
        { success: false, message: 'لطفاً وارد شوید' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log('👤 کاربر:', userId);

    // دریافت همه DailyActivity های کاربر
    const dailyActivities = await prisma.dailyActivity.findMany({
      where: {
        userId: userId
      }
    });

    console.log(`📊 تعداد DailyActivities: ${dailyActivities.length}`);

    let fixedCount = 0;
    let errors = 0;

    // بررسی و فیکس هر DailyActivity
    for (const activity of dailyActivities) {
      try {
        // محاسبه پیشرفت واقعی
        const completedCount = [
          activity.videoWatched,
          activity.podcastListened,
          activity.wordsReviewed,
          activity.articleRead
        ].filter(Boolean).length;

        const correctProgress = Math.min(100, (completedCount / 4) * 100);
        
        // اگر progress اشتباه است، آپدیت کن
        if (activity.progress !== correctProgress) {
          console.log(`🔄 فیکس کردن ${activity.date.toLocaleDateString('fa-IR')}: ${activity.progress}% -> ${correctProgress}%`);
          
          await prisma.dailyActivity.update({
            where: { id: activity.id },
            data: { progress: correctProgress }
          });
          
          fixedCount++;
        }
      } catch (error) {
        console.error(`❌ خطا در فیکس کردن ${activity.id}:`, error);
        errors++;
      }
    }

    console.log(`✅ عملیات کامل شد: ${fixedCount} مورد فیکس شد، ${errors} خطا`);

    return NextResponse.json({
      success: true,
      data: {
        total: dailyActivities.length,
        fixed: fixedCount,
        errors: errors,
        message: `پیشرفت ${fixedCount} مورد از ${dailyActivities.length} فیکس شد`
      }
    });

  } catch (error) {
    console.error('❌ خطا در فیکس کردن پیشرفت:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطا در فیکس کردن پیشرفت',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}