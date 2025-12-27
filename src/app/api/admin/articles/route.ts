import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '../../../../../lib/server-auth';

// GET - لیست مقالات برای ادمین
export async function GET(request: Request) {
  try {
   const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        include: {
          vocabularies: true,
          createdBy: {
            select: { name: true, email: true }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.article.count()
    ]);

    return NextResponse.json({
      articles,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });

  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST - ایجاد مقاله جدید
export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      coverUrl,
      level,
      readingTime,
      vocabularies,
      isPublished = false
    } = body;

    // اعتبارسنجی فیلدهای ضروری
    if (!title || !content || !level) {
      return NextResponse.json(
        { error: 'Title, content, and level are required' },
        { status: 400 }
      );
    }

    const article = await prisma.article.create({
      data: {
        title,
        content,
        excerpt,
        coverUrl,
        level,
        readingTime: readingTime ? parseInt(readingTime) : null,
        isPublished,
        createdById: session.user.id,
        vocabularies: {
          create: vocabularies?.map((vocab: any) => ({
            word: vocab.word,
            meaning: vocab.meaning,
            paragraph: vocab.paragraph ? parseInt(vocab.paragraph) : null
          })) || []
        }
      },
      include: {
        vocabularies: true,
        createdBy: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      article,
      message: 'مقاله با موفقیت ایجاد شد'
    });

  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}