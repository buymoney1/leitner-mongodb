// app/video/[videoId]/page.tsx
import { PrismaClient } from '@prisma/client';
import { notFound, redirect } from 'next/navigation';
import { getAuthSession } from '../../../../lib/server-auth';
import VideoPlayer from '@/components/video/VideoPlayer';

const prisma = new PrismaClient();

export async function generateMetadata({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  
  try {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { title: true }
    });

    if (!video) {
      return {
        title: 'ویدیو یافت نشد'
      };
    }

    return {
      title: `${video.title} - آموزش انگلیسی`
    };
  } catch (error) {
    return {
      title: 'ویدیو آموزشی'
    };
  }
}

export default async function VideoPage({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  
  // بررسی احراز هویت
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  // دریافت داده‌های ویدیو
  try {
    const videoData = await prisma.video.findUnique({
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

    if (!videoData) {
      notFound();
    }

    // آماده کردن داده برای VideoPlayer
    const videoDataForPlayer = {
      id: videoData.id,
      title: videoData.title,
      description: videoData.description,
      videoUrl: videoData.videoUrl || '', // اگر videoUrl نداشت، رشته خالی بگذار
      thumbnailUrl: videoData.thumbnailUrl,
      level: videoData.level,
      subtitlesVtt: videoData.subtitlesVtt,
      vocabularies: videoData.vocabularies.map(v => ({
        id: v.id,
        word: v.word,
        meaning: v.meaning,
        videoId: v.videoId
      }))
    };

    // اگر ویدیو سریال است، به صفحه سریال ریدایرکت کن
    if (videoData.isSeries) {
      redirect(`/series/${videoId}`);
    }

    return (
      <div className="min-h-screen bg-gray-900">
        <VideoPlayer 
          initialVideoData={videoDataForPlayer}
          videoId={videoId}
        />
      </div>
    );
  } catch (error) {
    console.error('Error loading video:', error);
    notFound();
  }
}