// app/api/notifications/send-nightly/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import webpush from 'web-push';

const prisma = new PrismaClient();

// تنظیمات web-push با VAPID keys
webpush.setVapidDetails(
  'mailto:buymoney.10@gmail.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// این endpoint توسط cron job صدا زده می‌شود
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  // اعتبارسنجی با secret key
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 });
  }

  try {
    // 1. دریافت همه کاربران فعال
    const users = await prisma.user.findMany({
      where: {
        notificationEnabled: true,
        lastNotificationAt: {
          // حداقل 24 ساعت از آخرین نوتیفیکیشن گذشته باشد
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      include: {
        PushSubscription: true,
      },
    });

    console.log(`📤 ارسال نوتیفیکیشن به ${users.length} کاربر`);

    const results = [];

    // 2. ارسال نوتیفیکیشن به هر کاربر
    for (const user of users) {
      if (user.PushSubscription && user.PushSubscription.length > 0) {
        for (const subscription of user.PushSubscription) {
          try {
            const pushSubscription = {
              endpoint: subscription.endpoint,
              keys: subscription.keys,
            };

            // 3. ارسال پیام
            await webpush.sendNotification(
              pushSubscription,
              JSON.stringify({
                title: '🌙 شب بخیر!',
                body: 'الان زمان مناسبیه برای مرور لغات',
                icon: '/icon-192x192.png',
                badge: '/badge-72x72.png',
                tag: 'night-review',
                timestamp: new Date().toISOString(),
                url: '/review',
              })
            );

            // 4. آپدیت زمان آخرین نوتیفیکیشن
            await prisma.user.update({
              where: { id: user.id },
              data: { lastNotificationAt: new Date() },
            });

            // 5. ذخیره لاگ
            await prisma.notificationLog.create({
              data: {
                userId: user.id,
                title: 'شب بخیر',
                body: 'الان زمان مناسبیه برای مرور لغات',
                type: 'reminder',
                status: 'sent',
                pushToken: subscription.endpoint,
              },
            });

            results.push({ userId: user.id, status: 'success' });
          } catch (error) {
            console.error(`خطا در ارسال به کاربر ${user.id}:`, error);
            
            // ذخیره خطا
            await prisma.notificationLog.create({
              data: {
                userId: user.id,
                title: 'شب بخیر',
                body: 'الان زمان مناسبیه برای مرور لغات',
                type: 'reminder',
                status: 'failed',
                pushToken: subscription.endpoint,
                error: error instanceof Error ? error.message : 'خطای نامشخص',
              },
            });

            results.push({ userId: user.id, status: 'failed' });
          }
        }
      }
    }

    const successful = results.filter(r => r.status === 'success').length;
    const failed = results.filter(r => r.status === 'failed').length;

    return NextResponse.json({
      success: true,
      message: `نوتیفیکیشن‌ها ارسال شدند`,
      stats: {
        total: users.length,
        successful,
        failed,
      },
    });
  } catch (error) {
    console.error('خطا در ارسال نوتیفیکیشن:', error);
    return NextResponse.json(
      { error: 'خطا در ارسال نوتیفیکیشن' },
      { status: 500 }
    );
  }
}