// app/api/videos/[videoId]/vocabularies/route.ts
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {

    const { videoId } = params;

    console.log('Fetching vocabularies for videoId:', videoId);

    // بررسی وجود video
    const videoExists = await prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!videoExists) {
      console.log('Video not found:', videoId);
      return NextResponse.json(
        { error: 'ویدیو یافت نشد' },
        { status: 404 }
      );
    }

    // دریافت لغات ویدیو از دیتابیس
    const vocabularies = await prisma.videoVocabulary.findMany({
      where: {
        videoId: videoId
      },
      select: {
        id: true,
        word: true,
        meaning: true,
   
      },
      orderBy: {
        word: 'asc'
      }
    });

    console.log('Found vocabularies:', vocabularies.length);

    return NextResponse.json({
      success: true,
      vocabularies: vocabularies || [] // تضمین می‌کند که همیشه آرایه برگردد
    });

  } catch (error) {
    console.error('Error fetching video vocabularies:', error);
    return NextResponse.json(
      { 
        error: 'خطا در دریافت لغات',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}