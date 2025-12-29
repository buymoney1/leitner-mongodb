import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;

    const video = await prisma.video.findUnique({
      where: { 
        id: videoId,
        isSeries: true 
      },
      select: {
        id: true,
        title: true,
        totalSeasons: true,
        totalEpisodes: true,
        seasons: {
          select: {
            id: true,
            seasonNumber: true,
            title: true,
            episodes: {
              select: {
                id: true,
                title: true,
                episodeNumber: true
              }
            }
          }
        }
      }
    });

    if (!video) {
      return NextResponse.json(
        { error: 'سریال یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: video.id,
      title: video.title,
      totalSeasons: video.seasons.length,
      totalEpisodes: video.seasons.reduce((total, season) => 
        total + season.episodes.length, 0
      ),
      seasons: video.seasons.map(season => ({
        id: season.id,
        seasonNumber: season.seasonNumber,
        title: season.title,
        episodes: season.episodes
      }))
    });
  } catch (error) {
    console.error('Error fetching series info:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات سریال' },
      { status: 500 }
    );
  }
}