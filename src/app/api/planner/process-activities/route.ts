import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

// تایمر برای جلوگیری از پردازش همزمان
let isProcessing = false;

export async function POST(req: NextRequest) {
  try {
    console.log('🔄 شروع پردازش فعالیت‌ها...');
    
    // اگر در حال پردازش هستیم، صبر کن
    if (isProcessing) {
      console.log('⏳ در حال پردازش قبلی...');
      return NextResponse.json({
        success: true,
        message: 'در حال پردازش قبلی'
      });
    }

    isProcessing = true;
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      isProcessing = false;
      console.log('❌ کاربر لاگین نیست');
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    console.log('👤 کاربر:', session.user.id);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log('📅 امروز:', today.toLocaleDateString('fa-IR'));
    console.log('📅 فردا:', tomorrow.toLocaleDateString('fa-IR'));

    // 1. فعالیت‌های ثبت نشده امروز کاربر را بگیر
    const unregisteredActivities = await prisma.activityTracking.findMany({
      where: {
        userId: session.user.id,
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

    if (unregisteredActivities.length === 0) {
      isProcessing = false;
      console.log('✅ هیچ فعالیت جدیدی برای ثبت وجود ندارد');
      return NextResponse.json({
        success: true,
        message: 'فعالیت جدیدی برای ثبت وجود ندارد'
      });
    }

    // 2. گروه‌بندی فعالیت‌ها بر اساس نوع
    const activitiesByType = unregisteredActivities.reduce((acc, activity) => {
      if (!acc[activity.activityType]) {
        acc[activity.activityType] = [];
      }
      acc[activity.activityType].push(activity);
      return acc;
    }, {} as Record<string, typeof unregisteredActivities>);

    console.log('📈 گروه‌بندی فعالیت‌ها:', Object.keys(activitiesByType));

    // 3. یافتن یا ایجاد DailyActivity برای امروز
    let dailyActivity = await prisma.dailyActivity.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today
        }
      }
    });

    console.log('📅 DailyActivity موجود:', dailyActivity ? 'بله' : 'خیر');

    if (!dailyActivity) {
      console.log('🆕 ایجاد DailyActivity جدید');
      dailyActivity = await prisma.dailyActivity.create({
        data: {
          userId: session.user.id,
          date: today,
          progress: 0
        }
      });
    }

    // 4. قوانین ثبت برای هر نوع فعالیت
    const updateData: any = {};
    const completedActivities = [];

    // ویدیو: حداقل 10 ثانیه تماشا (برای تست)
    if (activitiesByType['video']) {
      const totalVideoTime = activitiesByType['video'].reduce((sum, act) => sum + act.duration, 0);
      console.log('🎬 زمان کل ویدیو:', totalVideoTime, 'ثانیه');
      
      if (totalVideoTime >= 10) { // 10 ثانیه برای تست
        console.log('✅ ویدیو کامل شد');
        updateData.videoWatched = true;
        
        // پیدا کردن آخرین ویدیو تماشا شده
        const latestVideo = activitiesByType['video']
          .filter(act => act.contentId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        
        if (latestVideo?.contentId) {
          console.log('🎥 ویدیو ID:', latestVideo.contentId);
          updateData.videoId = latestVideo.contentId;
        }
        
        completedActivities.push(...activitiesByType['video'].map(act => act.id));
      }
    }

    // پادکست: حداقل 10 ثانیه گوش دادن
    if (activitiesByType['podcast']) {
      const totalPodcastTime = activitiesByType['podcast'].reduce((sum, act) => sum + act.duration, 0);
      console.log('🎧 زمان کل پادکست:', totalPodcastTime, 'ثانیه');
      
      if (totalPodcastTime >= 10) { // 10 ثانیه برای تست
        console.log('✅ پادکست کامل شد');
        updateData.podcastListened = true;
        
        const latestPodcast = activitiesByType['podcast']
          .filter(act => act.contentId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        
        if (latestPodcast?.contentId) {
          console.log('🎧 پادکست ID:', latestPodcast.contentId);
          updateData.podcastId = latestPodcast.contentId;
        }
        
        completedActivities.push(...activitiesByType['podcast'].map(act => act.id));
      }
    }

    // لغات: حداقل 10 ثانیه مرور
    if (activitiesByType['words']) {
      const totalWordsTime = activitiesByType['words'].reduce((sum, act) => sum + act.duration, 0);
      console.log('📚 زمان کل لغات:', totalWordsTime, 'ثانیه');
      
      if (totalWordsTime >= 10) { // 10 ثانیه برای تست
        console.log('✅ لغات کامل شد');
        updateData.wordsReviewed = true;
        completedActivities.push(...activitiesByType['words'].map(act => act.id));
      }
    }

    // مقاله: حداقل 10 ثانیه مطالعه
    if (activitiesByType['article']) {
      const totalArticleTime = activitiesByType['article'].reduce((sum, act) => sum + act.duration, 0);
      console.log('📖 زمان کل مقاله:', totalArticleTime, 'ثانیه');
      
      if (totalArticleTime >= 10) { // 10 ثانیه برای تست
        console.log('✅ مقاله کامل شد');
        updateData.articleRead = true;
        
        const latestArticle = activitiesByType['article']
          .filter(act => act.contentId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        
        if (latestArticle?.contentId) {
          console.log('📖 مقاله ID:', latestArticle.contentId);
          updateData.articleId = latestArticle.contentId;
        }
        
        completedActivities.push(...activitiesByType['article'].map(act => act.id));
      }
    }

    // 5. محاسبه پیشرفت
    const completedCount = [
      updateData.videoWatched,
      updateData.podcastListened,
      updateData.wordsReviewed,
      updateData.articleRead
    ].filter(Boolean).length;

    console.log('📊 فعالیت‌های تکمیل شده:', completedCount);

    updateData.progress = Math.min(100, (completedCount / 4) * 100);
    console.log('📈 پیشرفت:', updateData.progress, '%');

    // اگر فعالیتی تکمیل شده، تاریخ تکمیل را ثبت کن
    if (completedCount > 0 && dailyActivity.progress < 100 && updateData.progress >= 100) {
      updateData.completedAt = new Date();
      console.log('🏆 روز کامل شد!');
    }

    // 6. آپدیت DailyActivity
    if (Object.keys(updateData).length > 0) {
      console.log('🔄 آپدیت DailyActivity:', updateData);
      await prisma.dailyActivity.update({
        where: { id: dailyActivity.id },
        data: updateData
      });
    }

    // 7. فعالیت‌های ثبت شده را مارک کن
    if (completedActivities.length > 0) {
      console.log('✅ مارک کردن فعالیت‌های ثبت شده:', completedActivities.length);
      await prisma.activityTracking.updateMany({
        where: {
          id: { in: completedActivities }
        },
        data: {
          isRegistered: true,
          registeredAt: new Date()
        }
      });
    }

    isProcessing = false;
    console.log('✅ پردازش با موفقیت انجام شد');

    return NextResponse.json({
      success: true,
      data: {
        updated: completedActivities.length,
        progress: updateData.progress || dailyActivity.progress,
        completedCount,
        updateData
      }
    });

  } catch (error) {
    isProcessing = false;
    console.error('❌ Error processing activities:', error);
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