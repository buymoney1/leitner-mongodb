// app/api/user/stats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "../../../../../lib/server-auth";

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // دریافت چند آمار به صورت موازی برای بهینه‌سازی
    const [
      totalCards,
      dueCards,
      cardsByBox,
      userBooks,
    ] = await Promise.all([
      // ۱. تعداد کل کارت‌های کاربر
      prisma.card.count({
        where: { userId },
      }),

      // ۲. تعداد کارت‌های سررسید برای امروز
      prisma.card.count({
        where: {
          userId,
          nextReviewAt: {
            lte: new Date(),
          },
        },
      }),

      // ۳. گروه‌بندی کارت‌ها بر اساس شماره جعبه
      prisma.card.groupBy({
        by: ['boxNumber'],
        where: { userId },
        _count: {
          boxNumber: true,
        },
      }),

      // ۴. لیست کتاب‌های کاربر
      prisma.book.findMany({
        where: { userId },
        select: { id: true, title: true },
      }),
    ]);

    // تبدیل آرایه groupBy به یک آبجکت برای استفاده آسان‌تر
    const boxCounts = cardsByBox.reduce((acc, item) => {
      acc[item.boxNumber] = item._count.boxNumber;
      return acc;
    }, {} as Record<number, number>);

    return NextResponse.json({
      totalCards,
      dueCards,
      boxCounts,
      books: userBooks,
    });

  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}