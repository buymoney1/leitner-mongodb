// app/api/videos/level/[level]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ level: string }> }
) {
  try {
    const { level } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '4');

    console.log(`🔍 API Called: Fetching ${limit} videos for level ${level}`);

    // لیست تمام ویدیوها برای دیباگ
    const allVideos = await prisma.video.findMany({
      select: {
        id: true,
        title: true,
        level: true,
        isPublished: true,
        isSeries: true
      }
    });
    
    console.log('📊 All videos in database:', allVideos);
    
    // بررسی کنید آیا ویدیوها سطح دارند
    const videosWithLevels = allVideos.filter(v => v.level);
    console.log('🎯 Videos with levels:', videosWithLevels.length);
    
    const requestedLevelVideos = allVideos.filter(v => v.level === level);
    console.log(`🎯 Videos with level ${level}:`, requestedLevelVideos.length);

    // دریافت ویدیوهای منتشر شده برای سطح مورد نظر
    const videos = await prisma.video.findMany({
      where: { 
        level: level as any,
        isPublished: true 
      },
      select: {
        id: true,
        title: true,
        level: true,
        description: true,
        thumbnailUrl: true,
        coverImage: true,
        isSeries: true,
        totalSeasons: true,
        totalEpisodes: true,
        duration: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    console.log(`✅ Found ${videos.length} published videos for level ${level}:`, videos);

    // اگر ویدیویی پیدا نشد، ویدیوهای منتشر نشده را هم نشان بده
    if (videos.length === 0) {
      const unpublished = await prisma.video.findMany({
        where: { 
          level: level as any,
          isPublished: false 
        },
        select: {
          id: true,
          title: true,
          level: true,
          isPublished: true
        }
      });
      
      console.log(`📋 Unpublished videos for ${level}:`, unpublished);
    }

    return NextResponse.json(videos);
  } catch (error) {
    console.error('❌ Error fetching videos by level:', error);
    return NextResponse.json(
      { 
        error: 'خطا در دریافت ویدیوها',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}