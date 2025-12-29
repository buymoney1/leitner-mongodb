// app/api/videos/[videoId]/check-type/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;

    console.log(`🔍 Checking video type for ID: ${videoId}`);

    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        title: true,
        isSeries: true,
        videoUrl: true, // لینک ویدیو برای فیلم‌های تک قسمتی
        seasons: {
          select: {
            id: true,
            seasonNumber: true,
            episodes: {
              select: {
                id: true,
                episodeNumber: true,
                videoUrl: true
              }
            }
          }
        }
      }
    });

    if (!video) {
      return NextResponse.json(
        { error: 'ویدیو یافت نشد' },
        { status: 404 }
      );
    }

    console.log(`📊 Video found: ${video.title}`);
    console.log(`📺 Is series: ${video.isSeries}`);
    console.log(`🔗 Video URL: ${video.videoUrl}`);
    console.log(`🎬 Seasons: ${video.seasons.length}`);

    return NextResponse.json({
      id: video.id,
      title: video.title,
      isSeries: video.isSeries,
      videoUrl: video.videoUrl,
      hasVideoUrl: !!video.videoUrl,
      seasonsCount: video.seasons.length,
      episodesCount: video.seasons.reduce((total, season) => total + season.episodes.length, 0),
      firstSeason: video.seasons[0] ? {
        seasonNumber: video.seasons[0].seasonNumber,
        episodes: video.seasons[0].episodes.map(ep => ({
          episodeNumber: ep.episodeNumber,
          hasVideoUrl: !!ep.videoUrl
        }))
      } : null
    });
  } catch (error) {
    console.error('Error checking video type:', error);
    return NextResponse.json(
      { error: 'خطا در بررسی ویدیو' },
      { status: 500 }
    );
  }
}