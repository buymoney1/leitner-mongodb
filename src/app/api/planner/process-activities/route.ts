
import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';
import { getAuthSession } from '../../../../../lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    console.log('🔄 شروع پردازش فعالیت‌ها...');
    
    const session = await getAuthSession();

    if (!session || !session.user || !session.user.id) {
      console.log('❌ کاربر لاگین نیست');
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const userId = session.user.id;
    console.log('👤 کاربر:', userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log('📅 امروز:', today.toLocaleDateString('fa-IR'));

    // دریافت فعالیت‌های ثبت نشده امروز
    const unregisteredActivities = await prisma.activityTracking.findMany({
      where: {
        userId: userId,
        isRegistered: false,
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log('📊 فعالیت‌های ثبت‌نشده:', unregisteredActivities.length);

    // دریافت یا ایجاد DailyActivity برای امروز
    let dailyActivity = await prisma.dailyActivity.findUnique({
      where: {
        userId_date: {
          userId: userId,
          date: today
        }
      }
    });

    if (!dailyActivity) {
      console.log('🆕 ایجاد DailyActivity جدید');
      dailyActivity = await prisma.dailyActivity.create({
        data: {
          userId: userId,
          date: today,
          progress: 0
        }
      });
    }

    console.log('📈 وضعیت فعلی:', {
      progress: dailyActivity.progress,
      video: dailyActivity.videoWatched,
      podcast: dailyActivity.podcastListened,
      words: dailyActivity.wordsReviewed,
      article: dailyActivity.articleRead
    });

    // اگر هیچ فعالیت ثبت نشده‌ای نبود، فقط پیشرفت را محاسبه کن
    if (unregisteredActivities.length === 0) {
      console.log('📭 هیچ فعالیت جدیدی برای ثبت وجود ندارد');
      
      // اما باز هم پیشرفت را محاسبه و ذخیره کن
      const completedCount = [
        dailyActivity.videoWatched,
        dailyActivity.podcastListened,
        dailyActivity.wordsReviewed,
        dailyActivity.articleRead
      ].filter(Boolean).length;

      const correctProgress = Math.min(100, (completedCount / 4) * 100);
      
      // اگر progress اشتباه است، آپدیت کن
      if (dailyActivity.progress !== correctProgress) {
        console.log(`🔄 تصحیح پیشرفت: ${dailyActivity.progress}% -> ${correctProgress}%`);
        
        await prisma.dailyActivity.update({
          where: { id: dailyActivity.id },
          data: { progress: correctProgress }
        });
      }
      
      return NextResponse.json({
        success: true,
        data: {
          updated: 0,
          progress: correctProgress,
          completedCount,
          message: 'پیشرفت محاسبه شد'
        }
      });
    }

    // گروه‌بندی فعالیت‌ها بر اساس نوع
    const activitiesByType = unregisteredActivities.reduce((acc, activity) => {
      if (!acc[activity.activityType]) {
        acc[activity.activityType] = [];
      }
      acc[activity.activityType].push(activity);
      return acc;
    }, {} as Record<string, typeof unregisteredActivities>);

    console.log('📈 فعالیت‌ها بر اساس نوع:', Object.keys(activitiesByType));

    // پردازش هر نوع فعالیت
    const updateData: any = {};
    const completedActivities: string[] = [];

    // ویدیو
    if (activitiesByType['video']) {
      const totalVideoTime = activitiesByType['video'].reduce((sum, act) => sum + act.duration, 0);
      console.log('🎬 زمان کل ویدیو:', totalVideoTime, 'ثانیه');
      
      if (totalVideoTime >= 10 && !dailyActivity.videoWatched) {
        console.log('✅ ویدیو کامل شد');
        updateData.videoWatched = true;
        
        const latestVideo = activitiesByType['video']
          .filter(act => act.contentId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        
        if (latestVideo?.contentId) {
          updateData.videoId = latestVideo.contentId;
        }
        
        completedActivities.push(...activitiesByType['video'].map(act => act.id));
      }
    }

    // پادکست
    if (activitiesByType['podcast']) {
      const totalPodcastTime = activitiesByType['podcast'].reduce((sum, act) => sum + act.duration, 0);
      console.log('🎧 زمان کل پادکست:', totalPodcastTime, 'ثانیه');
      
      if (totalPodcastTime >= 10 && !dailyActivity.podcastListened) {
        console.log('✅ پادکست کامل شد');
        updateData.podcastListened = true;
        
        const latestPodcast = activitiesByType['podcast']
          .filter(act => act.contentId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        
        if (latestPodcast?.contentId) {
          updateData.podcastId = latestPodcast.contentId;
        }
        
        completedActivities.push(...activitiesByType['podcast'].map(act => act.id));
      }
    }

    // لغات
    if (activitiesByType['words']) {
      const totalWordsTime = activitiesByType['words'].reduce((sum, act) => sum + act.duration, 0);
      console.log('📚 زمان کل لغات:', totalWordsTime, 'ثانیه');
      
      if (totalWordsTime >= 10 && !dailyActivity.wordsReviewed) {
        console.log('✅ لغات کامل شد');
        updateData.wordsReviewed = true;
        completedActivities.push(...activitiesByType['words'].map(act => act.id));
      }
    }

    // مقاله
    if (activitiesByType['article']) {
      const totalArticleTime = activitiesByType['article'].reduce((sum, act) => sum + act.duration, 0);
      console.log('📖 زمان کل مقاله:', totalArticleTime, 'ثانیه');
      
      if (totalArticleTime >= 10 && !dailyActivity.articleRead) {
        console.log('✅ مقاله کامل شد');
        updateData.articleRead = true;
        
        const latestArticle = activitiesByType['article']
          .filter(act => act.contentId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        
        if (latestArticle?.contentId) {
          updateData.articleId = latestArticle.contentId;
        }
        
        completedActivities.push(...activitiesByType['article'].map(act => act.id));
      }
    }

    // محاسبه پیشرفت نهایی
    const currentStatus = {
      video: updateData.videoWatched || dailyActivity.videoWatched,
      podcast: updateData.podcastListened || dailyActivity.podcastListened,
      words: updateData.wordsReviewed || dailyActivity.wordsReviewed,
      article: updateData.articleRead || dailyActivity.articleRead
    };

    const completedCount = Object.values(currentStatus).filter(Boolean).length;
    const progress = Math.min(100, (completedCount / 4) * 100);
    
    // همیشه progress را در updateData قرار بده
    updateData.progress = progress;

    console.log('📊 وضعیت نهایی:', currentStatus);
    console.log('📈 پیشرفت محاسبه شده:', progress, '%');

    // آپدیت DailyActivity
    if (Object.keys(updateData).length > 0) {
      console.log('🔄 آپدیت DailyActivity با:', updateData);
      await prisma.dailyActivity.update({
        where: { id: dailyActivity.id },
        data: updateData
      });
    } else {
      // اگر آپدیتی نبود ولی progress اشتباه است، آن را تصحیح کن
      if (dailyActivity.progress !== progress) {
        console.log(`🔄 تصحیح پیشرفت بدون آپدیت: ${dailyActivity.progress}% -> ${progress}%`);
        await prisma.dailyActivity.update({
          where: { id: dailyActivity.id },
          data: { progress: progress }
        });
      }
    }

    // مارک کردن فعالیت‌های ثبت شده
    if (completedActivities.length > 0) {
      console.log('✅ مارک کردن فعالیت‌های ثبت شده:', completedActivities.length);
      await prisma.activityTracking.updateMany({
        where: { id: { in: completedActivities } },
        data: { isRegistered: true, registeredAt: new Date() }
      });
    }

    // اگر روز کامل شد، تاریخ تکمیل را ثبت کن
    if (progress === 100 && !dailyActivity.completedAt) {
      console.log('🏆 روز کامل شد!');
      await prisma.dailyActivity.update({
        where: { id: dailyActivity.id },
        data: { completedAt: new Date() }
      });
    }

    console.log('=== پردازش کامل شد ===');
    
    return NextResponse.json({
      success: true,
      data: {
        updated: completedActivities.length,
        progress: progress,
        completedCount,
        currentStatus,
        message: completedActivities.length > 0 ? 'فعالیت‌های جدید پردازش شدند' : 'پیشرفت محاسبه شد'
      }
    });

  } catch (error) {
    console.error('❌ خطا در پردازش:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطا در پردازش فعالیت‌ها',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}