import { NextRequest, NextResponse } from 'next/server';

import {prisma} from '@/lib/prisma';
import path from 'path';
import { promises as fs } from 'fs';
import { getAuthSession } from '../../../../../lib/server-auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'لطفاً وارد شوید' }, { status: 401 });
    }

    const { templateBookId } = await request.json();

    // 1. خواندن اطلاعات کتاب از فایل اصلی
    const booksIndexPath = path.join(
      process.cwd(),
      'data',
      'template-books',
      'index.json'
    );
    const booksData = await fs.readFile(booksIndexPath, 'utf-8');
    const allBooks = JSON.parse(booksData);
    
    const templateBook = allBooks.find((book: any) => book.id === templateBookId);
    
    if (!templateBook) {
      return NextResponse.json(
        { error: 'کتاب مورد نظر یافت نشد' },
        { status: 404 }
      );
    }

    // 2. خواندن کارت‌ها از فایل جداگانه
    const cardsFilePath = path.join(
      process.cwd(),
      'data',
      'template-cards',
      templateBook.cardsFile
    );
    const cardsData = await fs.readFile(cardsFilePath, 'utf-8');
    const templateCards = JSON.parse(cardsData);

    // 3. بررسی وجود کتاب در دیتابیس
    const existingBook = await prisma.book.findFirst({
      where: {
        userId: session.user.id,
        title: templateBook.title,
      },
      include: {
        cards: {
          select: { front: true }
        }
      }
    });

    let cardsAdded = 0;
    let bookId;

    if (existingBook) {
      // کتاب موجود است - فقط کارت‌های جدید اضافه کن
      bookId = existingBook.id;
      
      // استخراج کارت‌های موجود
      const existingCardFronts = new Set(
        existingBook.cards.map(card => card.front)
      );
      
      // فقط کارت‌های جدید که قبلاً وجود ندارند
      const newCards = templateCards.filter(
        (card: any) => !existingCardFronts.has(card.front)
      );
      
      if (newCards.length > 0) {
        // اضافه کردن کارت‌های جدید
        await prisma.card.createMany({
          data: newCards.map((card: any) => ({
            front: card.front,
            back: card.back,
            hint: card.hint || '',
            bookId: existingBook.id,
            userId: session.user.id,
            boxNumber: 1,
            lastReviewedAt: new Date(),
            nextReviewAt: new Date(),
          }))
        });
        
        cardsAdded = newCards.length;
      }
      
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        cardsAdded,
        message: cardsAdded > 0 
          ? `${cardsAdded} لغت جدید اضافه شد` 
          : 'همه لغات قبلاً اضافه شده‌اند',
      });
      
    } else {
      // کتاب جدید - ایجاد کتاب و کارت‌ها
      const newBook = await prisma.book.create({
        data: {
          title: templateBook.title,
          description: templateBook.description,
          userId: session.user.id,
          cards: {
            create: templateCards.map((card: any) => ({
              front: card.front,
              back: card.back,
              hint: card.hint || '',
              userId: session.user.id,
              boxNumber: 1,
              lastReviewedAt: new Date(),
              nextReviewAt: new Date(),
            }))
          }
        },
        include: {
          cards: true
        }
      });
      
      bookId = newBook.id;
      cardsAdded = templateCards.length;
      
      return NextResponse.json({
        success: true,
        alreadyExists: false,
        cardsAdded,
        message: 'کتاب جدید با موفقیت اضافه شد',
      });
    }

  } catch (error) {
    console.error('خطا در اضافه کردن کتاب:', error);
    return NextResponse.json(
      { error: 'خطا در اضافه کردن کتاب' },
      { status: 500 }
    );
  }
}