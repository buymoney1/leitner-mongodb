// app/api/videos/level/[level]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, VideoLevel } from '@prisma/client';

const prisma = new PrismaClient();

// تعریف یک type guard برای بررسی معتبر بودن level
function isValidVideoLevel(level: string): level is VideoLevel {
  return Object.values(VideoLevel).includes(level as VideoLevel);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ level: string }> }
) {
  try {
    const { level } = await params;
    
    // بررسی معتبر بودن level
    if (!isValidVideoLevel(level)) {
      return NextResponse.json(
        { error: 'سطح ویدیو نامعتبر است' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    // حالا می‌توانیم از level به عنوان VideoLevel استفاده کنیم
    const videos = await prisma.video.findMany({
      where: { level: level }, // دیگر نیازی به type assertion نیست
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        level: true,
        thumbnailUrl: true,
        createdAt: true,
        description: true, // اضافه کردن description
      }
    });

    // تبدیل createdAt به string برای serialization
    const formattedVideos = videos.map(video => ({
      ...video,
      createdAt: video.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedVideos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    
    // نمایش خطای دقیق‌تر
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    
    return NextResponse.json(
      { error: 'خطا در دریافت ویدیوها' },
      { status: 500 }
    );
  }
}