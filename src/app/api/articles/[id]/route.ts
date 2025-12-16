// app/api/articles/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // اضافه کردن Promise
) {
  try {
    // await کردن params قبل از استفاده
    const { id } = await params;
    
    const article = await prisma.article.findUnique({
      where: { id }, // استفاده از id بعد از await
      include: {
        vocabularies: {
          orderBy: { paragraph: 'asc' }
        },
      },
    });

    if (!article) {
      return NextResponse.json(
        { error: 'مقاله یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت مقاله' },
      { status: 500 }
    );
  }
}