// src/app/api/flashcards/progress/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateProgress } from '@/utils/progress'; // <-- Import تابع جدید
import { getAuthSession } from '../../../../../lib/server-auth';

export async function GET() {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. دریافت تعداد کارت‌ها بر اساس جعبه از دیتابیس
    const cardsByBox = await prisma.card.groupBy({
      by: ['boxNumber'],
      where: {
        userId: session.user.id,
      },
      _count: {
        id: true,
      },
      orderBy: {
        boxNumber: 'asc',
      },
    });

    // 2. تبدیل خروجی Prisma به فرمت مورد انتظار تابع calculateProgress
    const boxData = cardsByBox.map(item => ({
      boxNumber: item.boxNumber,
      count: item._count.id,
    }));

    // 3. محاسبه پیشرفت با استفاده از فرمول جدید
    const { overallProgress, totalCards, chartData } = calculateProgress(boxData);

    // 4. اطمینان از وجود تمام جعبه‌ها (1 تا 8) در نمودار برای نمایش بهتر
    // (مگر اینکه maxBox را متفاوت تنظیم کرده باشید)
    const maxBox = 8; // می‌توانید این مقدار را از تابع calculateProgress نیز بخوانید
    const finalChartData = [];
    for (let i = 1; i <= maxBox; i++) {
      const found = chartData.find(item => item.boxNumber === i);
      finalChartData.push({
        box: `جعبه ${i}`,
        boxNumber: i,
        count: found ? found.count : 0,
        progress: found ? found.progress : 0,
      });
    }

    return NextResponse.json({
      data: finalChartData,
      overallProgress,
      totalCards,
    });
  } catch (error) {
    console.error('خطا در دریافت داده‌های فلش‌کارت:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت داده‌ها' },
      { status: 500 }
    );
  }
}