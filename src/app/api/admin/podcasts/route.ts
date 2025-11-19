import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - لیست پادکست‌ها برای ادمین
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [podcasts, total] = await Promise.all([
      prisma.podcast.findMany({
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
      prisma.podcast.count()
    ]);

    return NextResponse.json({
      podcasts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });

  } catch (error) {
    console.error('Error fetching podcasts:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST - ایجاد پادکست جدید
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      audioUrl,
      coverUrl,
      duration,
      level,
      vocabularies,
      isPublished = false
    } = body;

    // اعتبارسنجی فیلدهای ضروری
    if (!title || !audioUrl || !level) {
      return NextResponse.json(
        { error: 'Title, audio URL, and level are required' },
        { status: 400 }
      );
    }

    const podcast = await prisma.podcast.create({
      data: {
        title,
        description,
        audioUrl,
        coverUrl,
        duration: duration ? parseInt(duration) : null,
        level,
        isPublished,
        createdById: session.user.id,
        vocabularies: {
          create: vocabularies?.map((vocab: any) => ({
            word: vocab.word,
            meaning: vocab.meaning,
            timestamp: vocab.timestamp ? parseInt(vocab.timestamp) : null
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
      podcast,
      message: 'پادکست با موفقیت ایجاد شد'
    });

  } catch (error) {
    console.error('Error creating podcast:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}