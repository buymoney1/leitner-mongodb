// app/api/series/[videoId]/info/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;

    console.log(`Fetching series info for videoId: ${videoId}`);

    const video = await prisma.video.findUnique({
      where: { 
        id: videoId
      },
      select: {
        id: true,
        isSeries: true,
        totalSeasons: true,
        totalEpisodes: true,
        seasons: {
          select: {
            id: true,
            episodes: {
              select: {
                id: true
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

    const response = {
      totalSeasons: video.isSeries ? video.seasons.length : video.totalSeasons || 1,
      totalEpisodes: video.isSeries 
        ? video.seasons.reduce((total, season) => total + season.episodes.length, 0)
        : video.totalEpisodes || 1
    };

    console.log(`Series info for ${videoId}:`, response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching series info:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات سریال' },
      { status: 500 }
    );
  }
}