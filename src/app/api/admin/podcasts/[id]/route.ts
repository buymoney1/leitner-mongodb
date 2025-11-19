import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET - دریافت جزئیات پادکست برای ویرایش
export async function GET(request: Request, { params }: Params) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const podcast = await prisma.podcast.findUnique({
      where: { id },
      include: {
        vocabularies: {
          orderBy: { timestamp: 'asc' }
        },
        createdBy: {
          select: { name: true, email: true }
        }
      }
    });

    if (!podcast) {
      return NextResponse.json(
        { error: 'Podcast not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(podcast);

  } catch (error) {
    console.error('Error fetching podcast:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH - ویرایش پادکست
export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await auth();
    const { id } = await params;

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
      isPublished
    } = body;

    // ابتدا پادکست موجود را پیدا کن
    const existingPodcast = await prisma.podcast.findUnique({
      where: { id },
      include: { vocabularies: true }
    });

    if (!existingPodcast) {
      return NextResponse.json(
        { error: 'Podcast not found' },
        { status: 404 }
      );
    }

    // آپدیت پادکست
    const updatedPodcast = await prisma.podcast.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(audioUrl && { audioUrl }),
        ...(coverUrl !== undefined && { coverUrl }),
        ...(duration !== undefined && { duration: duration ? parseInt(duration) : null }),
        ...(level && { level }),
        ...(isPublished !== undefined && { isPublished }),
        vocabularies: {
          deleteMany: {}, // حذف تمام لغات قبلی
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
      podcast: updatedPodcast,
      message: 'پادکست با موفقیت ویرایش شد'
    });

  } catch (error: any) {
    console.error('Error updating podcast:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Podcast not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE - حذف پادکست
export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.podcast.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'پادکست با موفقیت حذف شد'
    });

  } catch (error: any) {
    console.error('Error deleting podcast:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Podcast not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}