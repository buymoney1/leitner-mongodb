// app/api/admin/series/[seriesId]/edit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthSession } from '../../../../../../../lib/server-auth';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  const session = await getAuthSession();
  const userRole = (session?.user as any)?.role;

  if (!session || !session.user || userRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
  }

  try {
    const { seriesId } = await params;

    const series = await prisma.video.findUnique({
      where: { 
        id: seriesId,
        isSeries: true 
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        vocabularies: true,
        seasons: {
          orderBy: {
            seasonNumber: 'asc'
          },
          include: {
            episodes: {
              orderBy: {
                episodeNumber: 'asc'
              },
              include: {
                vocabularies: true
              }
            }
          }
        }
      }
    });

    if (!series) {
      return NextResponse.json(
        { error: 'سریال یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json(series);
  } catch (error) {
    console.error('Error fetching series for edit:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات سریال' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ seriesId: string }> }
) {
  const session = await getAuthSession();
  const userRole = (session?.user as any)?.role;

  if (!session || !session.user || userRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
  }

  try {
    const { seriesId } = await params;
    const body = await request.json();
    const { 
      title,
      description,
      coverImage,
      level,
      releaseYear,
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

    // بروزرسانی اطلاعات اصلی سریال
    await prisma.video.update({
      where: { id: seriesId },
      data: {
        title,
        description: description || null,
        coverImage: coverImage || null,
        level: level as any,
        totalSeasons,
        totalEpisodes,
        releaseYear,
        duration: Math.floor(totalDuration / 60),
      },
    });

    // بروزرسانی لغات عمومی
    // حذف لغات قبلی
    await prisma.videoVocabulary.deleteMany({
      where: { videoId: seriesId }
    });

    // افزودن لغات جدید
    if (generalVocabularies.length > 0) {
      await prisma.videoVocabulary.createMany({
        data: generalVocabularies.map((vocab: any) => ({
          videoId: seriesId,
          word: vocab.word,
          meaning: vocab.meaning
        })),
      });
    }

    // دریافت فصل‌های موجود
    const existingSeasons = await prisma.season.findMany({
      where: { videoId: seriesId },
      include: { episodes: true }
    });

    const existingSeasonIds = existingSeasons.map(s => s.id);
    const updatedSeasonIds = seasons.filter(s => s.id).map((s: any) => s.id);
    
    // حذف فصل‌هایی که در درخواست جدید نیستند
    const seasonsToDelete = existingSeasonIds.filter(id => !updatedSeasonIds.includes(id));
    
    for (const seasonId of seasonsToDelete) {
      await prisma.season.delete({
        where: { id: seasonId }
      });
    }

    // بروزرسانی یا ایجاد فصل‌ها
    for (const seasonData of seasons) {
      if (seasonData.id) {
        // بروزرسانی فصل موجود
        await prisma.season.update({
          where: { id: seasonData.id },
          data: {
            seasonNumber: seasonData.seasonNumber,
            title: seasonData.title,
            description: seasonData.description || null,
            thumbnailUrl: seasonData.thumbnailUrl || null,
          },
        });

        // دریافت قسمت‌های موجود فصل
        const existingEpisodes = await prisma.episode.findMany({
          where: { seasonId: seasonData.id },
          include: { vocabularies: true }
        });

        const existingEpisodeIds = existingEpisodes.map(e => e.id);
        const updatedEpisodeIds = seasonData.episodes.filter((e: any) => e.id).map((e: any) => e.id);
        
        // حذف قسمت‌هایی که در درخواست جدید نیستند
        const episodesToDelete = existingEpisodeIds.filter(id => !updatedEpisodeIds.includes(id));
        
        for (const episodeId of episodesToDelete) {
          await prisma.episode.delete({
            where: { id: episodeId }
          });
        }

        // بروزرسانی یا ایجاد قسمت‌ها
        for (const episodeData of seasonData.episodes) {
          if (episodeData.id) {
            // بروزرسانی قسمت موجود
            await prisma.episode.update({
              where: { id: episodeData.id },
              data: {
                episodeNumber: episodeData.episodeNumber,
                title: episodeData.title,
                description: episodeData.description || null,
                videoUrl: episodeData.videoUrl,
                thumbnailUrl: episodeData.thumbnailUrl || null,
                duration: episodeData.duration || 0,
                subtitlesVtt: episodeData.subtitlesVtt || null,
              },
            });

            // حذف لغات قبلی قسمت
            await prisma.episodeVocabulary.deleteMany({
              where: { episodeId: episodeData.id }
            });

            // افزودن لغات جدید
            if (episodeData.vocabularies && episodeData.vocabularies.length > 0) {
              await prisma.episodeVocabulary.createMany({
                data: episodeData.vocabularies.map((vocab: any) => ({
                  episodeId: episodeData.id,
                  word: vocab.word,
                  meaning: vocab.meaning
                })),
              });
            }
          } else {
            // ایجاد قسمت جدید
            const episode = await prisma.episode.create({
              data: {
                episodeNumber: episodeData.episodeNumber,
                title: episodeData.title,
                description: episodeData.description || null,
                videoUrl: episodeData.videoUrl,
                thumbnailUrl: episodeData.thumbnailUrl || null,
                duration: episodeData.duration || 0,
                subtitlesVtt: episodeData.subtitlesVtt || null,
                seasonId: seasonData.id,
              },
            });

            // افزودن لغات قسمت جدید
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
      } else {
        // ایجاد فصل جدید
        const season = await prisma.season.create({
          data: {
            seasonNumber: seasonData.seasonNumber,
            title: seasonData.title,
            description: seasonData.description || null,
            thumbnailUrl: seasonData.thumbnailUrl || null,
            releaseDate: new Date(),
            videoId: seriesId,
          },
        });

        // ایجاد قسمت‌های فصل جدید
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

          // افزودن لغات قسمت
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
    }

    return NextResponse.json({ 
      success: true, 
      message: 'سریال با موفقیت ویرایش شد',
      videoId: seriesId
    });
  } catch (error) {
    console.error('Update Series Error:', error);
    return NextResponse.json({ 
      error: 'Failed to update series',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}