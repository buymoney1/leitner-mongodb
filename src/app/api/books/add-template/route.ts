// app/api/books/add-template/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import path from "path";
import { getAuthSession } from "../../../../../lib/server-auth";

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

    let message = "";
    let bookToReturn;
    let cardsCount = 0;

    // ۳. بررسی اینکه آیا کاربر قبلا این کتاب را اضافه کرده است
    const existingBook = await prisma.book.findFirst({
      where: {
        userId: userId,
        title: templateBook.title,
      },
      include: {
        cards: true
      }
    });

    // ۴. استفاده از تراکنش
    const result = await prisma.$transaction(async (tx) => {
      if (existingBook) {
        // اگر کتاب از قبل وجود دارد، فقط کارت‌های جدید اضافه می‌شوند
        message = "این کتاب قبلاً در مجموعه شما موجود بود. لغات جدید به آن اضافه شد.";
        
        if (templateBook.cards && templateBook.cards.length > 0) {
          // فقط کارت‌هایی که قبلاً وجود ندارند را اضافه می‌کنیم
          const existingCardFronts = new Set(existingBook.cards.map(card => card.front));
          const newCards = templateBook.cards.filter(card => !existingCardFronts.has(card.front));
          
          if (newCards.length > 0) {
            await tx.card.createMany({
              data: newCards.map((card) => ({
                front: card.front,
                back: card.back,
                hint: card.hint,
                userId: userId,
                bookId: existingBook.id,
              })),
            });
            cardsCount = newCards.length;
          } else {
            message = "تمام لغات این کتاب قبلاً در مجموعه شما موجود هستند.";
          }
        }
        
        // کتاب موجود را با کارت‌های به‌روز شده برمی‌گردانیم
        bookToReturn = await tx.book.findUnique({
          where: { id: existingBook.id },
          include: { cards: true }
        });
        
      } else {
        // اگر کتاب وجود ندارد، کتاب جدید و تمام کارت‌هایش را ایجاد می‌کنیم
        const newUserBook = await tx.book.create({
          data: {
            title: templateBook.title,
            description: templateBook.description,
            userId: userId,
          },
        });

        if (templateBook.cards && templateBook.cards.length > 0) {
          await tx.card.createMany({
            data: templateBook.cards.map((card) => ({
              front: card.front,
              back: card.back,
              hint: card.hint,
              userId: userId,
              bookId: newUserBook.id,
            })),
          });
          cardsCount = templateBook.cards.length;
        }

        message = "کتاب جدید با موفقیت به مجموعه شما اضافه شد.";
        bookToReturn = newUserBook;
      }

      return { book: bookToReturn, message, cardsCount };
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      book: result.book,
      cardsAdded: result.cardsCount,
      alreadyExists: !!existingBook
    }, { status: 200 });

  } catch (error) {
    console.error("Error adding template book:", error);
    return NextResponse.json(
      { error: "خطای سرور داخلی" },
      { status: 500 }
    );
  }
}