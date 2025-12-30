import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { getAuthSession } from '../../../../../lib/server-auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'لطفاً وارد شوید' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId');
    const cardsFile = searchParams.get('cardsFile');

    if (!bookId || !cardsFile) {
      return NextResponse.json(
        { error: 'شناسه کتاب یا فایل کارت‌ها مشخص نشده' },
        { status: 400 }
      );
    }

    // مسیر فایل کارت‌ها
    const cardsFilePath = path.join(
      process.cwd(),
      'data',
      'template-cards',
      cardsFile
    );

    // خواندن فایل کارت‌ها
    const cardsData = await fs.readFile(cardsFilePath, 'utf-8');
    const cards = JSON.parse(cardsData);

    return NextResponse.json({ cards });
  } catch (error) {
    console.error('خطا در دریافت کارت‌ها:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت کارت‌ها' },
      { status: 500 }
    );
  }
}