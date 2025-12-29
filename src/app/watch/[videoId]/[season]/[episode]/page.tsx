// app/watch/[videoId]/[season]/[episode]/page.tsx
import { PrismaClient } from '@prisma/client';
import { notFound, redirect } from 'next/navigation';
import VideoPlayer from '@/components/video/VideoPlayer';
import { getAuthSession } from '../../../../../../lib/server-auth';

const prisma = new PrismaClient();

async function getEpisodeData(videoId: string, seasonNumber: number, episodeNumber: number) {
  try {
    const season = await prisma.season.findFirst({
      where: {
        videoId,
        seasonNumber: parseInt(seasonNumber.toString())
      },
      include: {
        video: true,
        episodes: {
          where: {
            episodeNumber: parseInt(episodeNumber.toString())
          },
          include: {
            vocabularies: true
          }
        }
      }
    });

    if (!season || !season.episodes.length) {
      return null;
    }

    const episode = season.episodes[0];
    
    // آماده کردن داده برای VideoPlayer
    const videoData = {
      id: episode.id,
      title: episode.title,
      description: episode.description,
      videoUrl: episode.videoUrl,
      thumbnailUrl: episode.thumbnailUrl || season.video.coverImage,
      level: season.video.level,
      subtitlesVtt: episode.subtitlesVtt,
      vocabularies: episode.vocabularies.map(v => ({
        id: v.id,
        word: v.word,
        meaning: v.meaning,
        videoId: episode.id
      }))
    };

    return {
      videoData,
      season,
      episode,
      series: season.video
    };
  } catch (error) {
    console.error('Error fetching episode:', error);
    return null;
  }
}

export default async function WatchEpisodePage({ 
  params 
}: { 
  params: Promise<{ videoId: string; season: string; episode: string }> 
}) {
  const { videoId, season, episode } = await params;
  
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");
  
  const data = await getEpisodeData(videoId, parseInt(season), parseInt(episode));
  
  if (!data) {
    notFound();
  }
  
  return (
    <div className="min-h-screen bg-gray-900">
      <VideoPlayer 
        initialVideoData={data.videoData}
        seasonNumber={data.season.seasonNumber}
        episodeNumber={data.episode.episodeNumber}
        seriesTitle={data.series.title}
        videoId={videoId}
      />
    </div>
  );
}