// app/api/admin/video/[videoId]/edit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthSession } from '../../../../../../../lib/server-auth';


const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const session = await getAuthSession();
  const userRole = (session?.user as any)?.role;

  if (!session || !session.user || userRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
  }

  try {
    const { videoId } = await params;

    const video = await prisma.video.findUnique({
      where: { 
        id: videoId,
        isSeries: false // فقط ویدیوهای تکی
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        vocabularies: true
      }
    });

    if (!video) {
      return NextResponse.json(
        { error: 'ویدیو یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error('Error fetching video for edit:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات ویدیو' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const session = await getAuthSession();
  const userRole = (session?.user as any)?.role;

  if (!session || !session.user || userRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
  }

  try {
    const { videoId } = await params;
    const body = await request.json();
    const { 
      title, 
      videoUrl, 
      thumbnailUrl, 
      description,
      level, 
      subtitles, 
      vocabularies 
    } = body;

    if (!title || !videoUrl || !level) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, videoUrl, level' 
      }, { status: 400 });
    }

    // بروزرسانی ویدیو
    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        title,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        description: description || null,
        level,
        subtitlesVtt: subtitles,
      },
    });

    // بروزرسانی لغات
    // حذف لغات قبلی
    await prisma.videoVocabulary.deleteMany({
      where: { videoId: videoId }
    });

    // افزودن لغات جدید
    if (vocabularies && vocabularies.length > 0) {
      await prisma.videoVocabulary.createMany({
        data: vocabularies.map((vocab: any) => ({
          videoId: videoId,
          word: vocab.word,
          meaning: vocab.meaning
        })),
      });
    }

    return NextResponse.json({ 
      success: true, 
      videoId: updatedVideo.id,
      message: 'ویدیو با موفقیت ویرایش شد',
      video: {
        id: updatedVideo.id,
        title: updatedVideo.title,
        level: updatedVideo.level,
        thumbnailUrl: updatedVideo.thumbnailUrl,
        updatedAt: updatedVideo.updatedAt
      }
    });
  } catch (error) {
    console.error('Update Video Error:', error);
    return NextResponse.json({ 
      error: 'Failed to update video',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}