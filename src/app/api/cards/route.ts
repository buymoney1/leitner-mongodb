// app/api/cards/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { front, back } = await request.json();

    if (!front || !back) {
      return NextResponse.json({ error: "Front and back are required" }, { status: 400 });
    }

    // ایجاد یک کارت جدید با منطق لایتنر
    const newCard = await prisma.card.create({
      data: {
        front,
        back,
        userId: session.user.id,
        boxNumber: 1, // کارت جدید همیشه به جعبه ۱ می‌رود
        nextReviewAt: new Date(), // برای مرور در لحظه حال
      },
    });

    return NextResponse.json(newCard, { status: 201 });

  } catch (error) {
    console.error("Error adding new card:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// GET را برای گرفتن کارت‌ها اصلاح می‌کنیم
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cards = await prisma.card.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        front: true,
        back: true,
        boxNumber: true,
        nextReviewAt: true, // <-- **این خط کلیدی را اضافه کردم**
        book: {
          select: {
            title: true,
          },
        },
      },
      orderBy: [
        { nextReviewAt: 'asc' }, // کارت‌های زودتر اول
        { updatedAt: 'desc' }, // سپس کارت‌های جدیدتر
      ],
    });

    return NextResponse.json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}