// app/api/videos/[videoId]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;

   const videoCount = await prisma.video.count();
   
    if (videoCount === 0) {
    return NextResponse.json(
        { 
          error: 'هیچ ویدیویی در سیستم وجود ندارد',
          suggestion: 'لطفاً ابتدا یک ویدیو از طریق پنل ادمین آپلود کنید'
        },
        { status: 404 }
      );
    }

    // لیست همه ویدیوهای موجود
    const allVideos = await prisma.video.findMany({
      select: { 
        id: true, 
        title: true,
        level: true,
        description:true
      },
      orderBy: { createdAt: 'desc' }
    });
    

    // ویدیوی مورد نظر را پیدا کن
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        vocabularies: {
          select: {
            id: true,
            word: true,
            meaning: true,
            videoId: true
          },
          orderBy: {
            word: 'asc'
          }
        }
      }
    });

    if (!video) {
      console.log(`❌ Video not found with ID: ${videoId}`);
      return NextResponse.json(
        { 
          error: 'ویدیو یافت نشد',
          availableVideos: allVideos,
          suggestion: 'از لیست ویدیوهای موجود یکی را انتخاب کنید'
        },
        { status: 404 }
      );
    }


    // ساخت response
    const responseData = {
      id: video.id,
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      level: video.level,
      subtitlesVtt: video.subtitlesVtt,
      vocabularies: video.vocabularies,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('🔥 Error in GET /api/videos/[videoId]:', error);
    
    return NextResponse.json(
      { 
        error: 'خطا در دریافت ویدیو',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}