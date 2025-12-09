// app/api/cards/bulk-delete/route.ts

import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export async function DELETE(request: NextRequest) {
  try {
    const { cardIds } = await request.json();

    if (!cardIds || !Array.isArray(cardIds) || cardIds.length === 0) {
      return NextResponse.json(
        { error: "لیست کارت‌ها الزامی است" },
        { status: 400 }
      );
    }

    // حذف کارت‌ها از دیتابیس
    await prisma.card.deleteMany({
      where: {
        id: {
          in: cardIds,
        },
      },
    });

    return NextResponse.json(
      { message: `${cardIds.length} کارت با موفقیت حذف شد` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting cards:", error);
    return NextResponse.json(
      { error: "خطا در حذف کارت‌ها" },
      { status: 500 }
    );
  }
}