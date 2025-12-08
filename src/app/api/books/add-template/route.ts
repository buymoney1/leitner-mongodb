// app/api/books/add-template/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import path from "path";
import { getAuthSession } from "../../../../../lib/server-auth";

// اینترفیس برای تایپ داده‌های کتاب الگو از فایل JSON
interface TemplateBook {
  id: string;
  title: string;
  description: string;
  cards: { front: string; back: string; hint: string }[];
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- راه حل کلیدی: ذخیره کردن userId در یک متغیر ثابت ---
    // این کار باعث می‌شود تایپ‌اسکریپت نوع آن را "فراموش" نکند
    const userId = session.user.id;

    const { templateBookId } = await request.json();

    if (!templateBookId) {
      return NextResponse.json({ error: "Template book ID is required" }, { status: 400 });
    }

    // ۱. خواندن فایل JSON از دیسک
    const filePath = path.join(process.cwd(), 'data', 'template-books.json');
    const fileContent = await readFile(filePath, 'utf-8');
    const templateBooks = JSON.parse(fileContent) as TemplateBook[];

    // ۲. پیدا کردن کتاب الگو بر اساس id
    const templateBook = templateBooks.find((book) => book.id === templateBookId);

    if (!templateBook) {
      return NextResponse.json({ error: "Template book not found" }, { status: 404 });
    }

    // ۳. بررسی اینکه آیا کاربر قبلا این کتاب را اضافه نکرده است
    const existingBook = await prisma.book.findFirst({
      where: {
        userId: userId, // از متغیر ثابت استفاده می‌کنیم
        title: templateBook.title,
      },
    });

    if (existingBook) {
      return NextResponse.json({ error: "شما قبلا این کتاب را به مجموعه خود اضافه کرده‌اید." }, { status: 409 });
    }

    // ۴. استفاده از تراکنش برای ایجاد کتاب و کارت‌ها
    const result = await prisma.$transaction(async (tx) => {
      const newUserBook = await tx.book.create({
        data: {
          title: templateBook.title,
          description: templateBook.description,
          userId: userId, // اینجا دیگر خطا نمی‌دهد
        },
      });

      if (templateBook.cards && templateBook.cards.length > 0) {
        await tx.card.createMany({
          data: templateBook.cards.map((card) => ({
            front: card.front,
            back: card.back,
            hint: card.hint,
            userId: userId, // اینجا هم از متغیر ثابت استفاده می‌کنیم
            bookId: newUserBook.id,
          })),
        });
      }

      return newUserBook;
    });

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error("Error adding template book:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}