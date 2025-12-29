// app/api/admin/upload-series/route.ts
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
      description,
      coverImage,
      level,
      releaseYear,
      isSeries,
      totalSeasons,
      totalEpisodes,
      generalVocabularies = [],
      seasons = []
    } = body;

    if (!title || !level) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, level' 
      }, { status: 400 });
    }

    // محاسبه مدت زمان کل
    const totalDuration = seasons.reduce((total: number, season: any) => {
      return total + season.episodes.reduce((epTotal: number, episode: any) => 
        epTotal + (episode.duration || 0), 0);
    }, 0);

    // ایجاد سریال
    const newVideo = await prisma.video.create({
      data: {
        title,
        description: description || null,
        coverImage: coverImage || null,
        level: level as any,
        isSeries: true,
        totalSeasons,
        totalEpisodes,
        releaseYear,
        duration: Math.floor(totalDuration / 60), // تبدیل به دقیقه
        createdById: session.user.id,
      },
    });

    // ایجاد لغات عمومی
    if (generalVocabularies.length > 0) {
      await prisma.videoVocabulary.createMany({
        data: generalVocabularies.map((vocab: any) => ({
          videoId: newVideo.id,
          word: vocab.word,
          meaning: vocab.meaning
        })),
      });
    }

    // ایجاد فصل‌ها و قسمت‌ها
    for (const seasonData of seasons) {
      const season = await prisma.season.create({
        data: {
          seasonNumber: seasonData.seasonNumber,
          title: seasonData.title,
          description: seasonData.description || null,
          thumbnailUrl: seasonData.thumbnailUrl || null,
          releaseDate: new Date(),
          videoId: newVideo.id,
        },
      });

      // ایجاد قسمت‌ها
      for (const episodeData of seasonData.episodes) {
        const episode = await prisma.episode.create({
          data: {
            episodeNumber: episodeData.episodeNumber,
            title: episodeData.title,
            description: episodeData.description || null,
            videoUrl: episodeData.videoUrl,
            thumbnailUrl: episodeData.thumbnailUrl || null,
            duration: episodeData.duration || 0,
            subtitlesVtt: episodeData.subtitlesVtt || null,
            seasonId: season.id,
          },
        });

        // ایجاد لغات قسمت
        if (episodeData.vocabularies && episodeData.vocabularies.length > 0) {
          await prisma.episodeVocabulary.createMany({
            data: episodeData.vocabularies.map((vocab: any) => ({
              episodeId: episode.id,
              word: vocab.word,
              meaning: vocab.meaning
            })),
          });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      videoId: newVideo.id,
      message: 'سریال با موفقیت آپلود شد',
      video: {
        id: newVideo.id,
        title: newVideo.title,
        level: newVideo.level,
        totalSeasons,
        totalEpisodes,
        createdAt: newVideo.createdAt
      }
    });
  } catch (error) {
    console.error('Upload Series Error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload series',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}