// app/api/admin/upload-video/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthSession } from '../../../../../lib/server-auth';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  const userRole = (session?.user as any)?.role;

  if (!session || !session.user || userRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
  }

  try {
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

    if (!title || !videoUrl || !level) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, videoUrl, level' 
      }, { status: 400 });
    }

    // ایجاد ویدیو با فیلدهای جدید
    const newVideo = await prisma.video.create({
      data: {
        title,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        level,
        subtitlesVtt: subtitles,
      },
    });

    // ایجاد لغت‌ها برای ویدیو
    if (vocabularies && vocabularies.length > 0) {
      await prisma.videoVocabulary.createMany({
        data: vocabularies.map((vocab: any) => ({
          ...vocab,
          videoId: newVideo.id,
        })),
      });
    }

    return NextResponse.json({ 
      success: true, 
      videoId: newVideo.id,
      message: 'ویدیو با موفقیت آپلود شد',
      video: {
        id: newVideo.id,
        title: newVideo.title,
        level: newVideo.level,
        thumbnailUrl: newVideo.thumbnailUrl,
        createdAt: newVideo.createdAt
      }
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload video',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}