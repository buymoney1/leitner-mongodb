// app/api/cards/due/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dueCards = await prisma.card.findMany({
      where: {
        userId: session.user.id,
        nextReviewAt: {
          lte: new Date(), // کارت‌هایی که زمان مرورشان گذشته یا الان است
        },
      },
      select: {
        id: true,
        front: true,
        back: true,
        boxNumber: true,
      },
      orderBy: [
        { nextReviewAt: 'asc' }, // قدیمی‌ترین‌ها را اول بیاور
      ],
    });

    return NextResponse.json(dueCards);
  } catch (error) {
    console.error("Error fetching due cards:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}