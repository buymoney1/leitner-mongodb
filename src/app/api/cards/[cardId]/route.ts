// app/api/cards/[cardId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// تغییر شماره ۱: تایپ params باید Promise باشد
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ cardId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newBoxNumber } = await request.json();

    if (typeof newBoxNumber !== 'number' || newBoxNumber < 1) {
      return NextResponse.json({ error: "Invalid box number" }, { status: 400 });
    }

    // تغییر شماره ۲: params باید await شود
    const { cardId } = await params;

    const nextReviewDate = new Date();
    const daysToAdd = Math.pow(2, newBoxNumber);
    nextReviewDate.setDate(nextReviewDate.getDate() + daysToAdd);

    const updatedCard = await prisma.card.update({
      where: {
        // تغییر شماره ۳: باید از متغیر cardId استفاده کنید
        id: cardId,
        userId: session.user.id,
      },
      data: {
        boxNumber: newBoxNumber,
        nextReviewAt: nextReviewDate,
      },
    });

    return NextResponse.json(updatedCard);

  } catch (error) {
    console.error("Error updating card:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}