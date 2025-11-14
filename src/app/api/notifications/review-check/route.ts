// src/app/api/notifications/review-check/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // پیدا کردن کاربر و زمان آخرین اطلاع‌رسانی او
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { lastReviewNotificationAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // **منطق اصلاح شده**
    // همیشه تعداد کارت‌های مرور را محاسبه کن
    const dueCardsCount = await prisma.card.count({
      where: {
        userId: session.user.id,
        nextReviewAt: {
          lte: now, // کارت‌هایی که زمان مرورشان رسیده یا گذشته است
        },
      },
    });

    // **فقط در صورتی که کاربر کارت مرور دارد و ۲۴ ساعت گذشته، زمان اطلاع‌رسانی را آپدیت کن**
    if (dueCardsCount > 0 && (!user.lastReviewNotificationAt || user.lastReviewNotificationAt < twentyFourHoursAgo)) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { lastReviewNotificationAt: now },
      });
    }

    return NextResponse.json({ count: dueCardsCount });

  } catch (error) {
    console.error("Error checking review notifications:", error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}