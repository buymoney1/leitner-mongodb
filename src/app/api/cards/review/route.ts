// app/api/cards/review/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "../../../../../lib/server-auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- راه حل کلیدی: ذخیره کردن userId در یک متغیر ثابت ---
    const userId = session.user.id;

    const { cardId, isCorrect } = await request.json();

    if (!cardId || typeof isCorrect !== 'boolean') {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    // پیدا کردن کارت برای اطمینان از اینکه متعلق به کاربر است
    const card = await prisma.card.findFirst({
      where: { id: cardId, userId: userId }, // از متغیر ثابت استفاده می‌کنیم
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // محاسبه زمان مرور بعدی و شماره جعبه جدید
    let newBoxNumber = card.boxNumber;
    const now = new Date();
    const futureReviewDate = new Date(now); // یک کپی از زمان حال ایجاد می‌کنیم

    if (isCorrect) {
      newBoxNumber = card.boxNumber + 1;
      const daysToAdd = Math.pow(2, newBoxNumber);
      futureReviewDate.setDate(futureReviewDate.getDate() + daysToAdd);
    } else {
      newBoxNumber = 1;
      futureReviewDate.setDate(futureReviewDate.getDate() + 1);
    }

    // استفاده از تراکنش برای اطمینان از صحت عملیات
    await prisma.$transaction(async (tx) => {
      // ۱. به‌روزرسانی کارت
      await tx.card.update({
        where: { id: cardId },
        data: {
          boxNumber: newBoxNumber,
          lastReviewedAt: now, // از زمان حال استفاده می‌کنیم
          nextReviewAt: futureReviewDate, // از زمان آینده استفاده می‌کنیم
        },
      });

      // ۲. ایجاد رکورد مرور برای تاریخچه
      await tx.review.create({
        data: {
          cardId: cardId,
          userId: userId, // از متغیر ثابت استفاده می‌کنیم
          isCorrect: isCorrect,
        },
      });
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}