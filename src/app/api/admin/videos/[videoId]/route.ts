// app/api/admin/videos/[videoId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthSession } from '../../../../../../lib/server-auth';


const prisma = new PrismaClient();

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const session = await getAuthSession();
  const userRole = (session?.user as any)?.role;

  if (!session || !session.user || userRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
  }

  try {
    const { videoId } = await params;
    const body = await req.json();
    const { 
      title, 
      videoUrl, 
      thumbnailUrl, 
      description,
      level, 
      subtitles, 
      vocabularies 
    } = body;

    // بررسی وجود ویدیو
    const existingVideo = await prisma.video.findUnique({
      where: { id: videoId }
    });

    if (!existingVideo) {
      return NextResponse.json({ 
        error: 'Video not found' 
      }, { status: 404 });
    }

    // حذف لغت‌های قبلی
    await prisma.videoVocabulary.deleteMany({
      where: { videoId }
    });

    // آپدیت ویدیو
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

    // ایجاد لغت‌های جدید
    if (vocabularies && vocabularies.length > 0) {
      await prisma.videoVocabulary.createMany({
        data: vocabularies.map((vocab: any) => ({
          ...vocab,
          videoId,
        })),
      });
    }

    return NextResponse.json({ 
      success: true, 
      videoId: updatedVideo.id,
      message: 'ویدیو با موفقیت ویرایش شد',
      video: updatedVideo
    });
  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ 
      error: 'Failed to update video',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  const session = await getAuthSession();
  const userRole = (session?.user as any)?.role;

  if (!session || !session.user || userRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
  }

  try {
    const { videoId } = await params;

    // بررسی وجود ویدیو
    const existingVideo = await prisma.video.findUnique({
      where: { id: videoId }
    });

    if (!existingVideo) {
      return NextResponse.json({ 
        error: 'Video not found' 
      }, { status: 404 });
    }

    // حذف ویدیو (با cascade به لغت‌ها)
    await prisma.video.delete({
      where: { id: videoId }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'ویدیو با موفقیت حذف شد'
    });
  } catch (error) {
    console.error('Delete Error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete video',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}