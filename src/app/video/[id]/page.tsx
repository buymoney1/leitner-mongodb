// app/videos/[id]/page.tsx

import { PrismaClient } from '@prisma/client';
import VideoPlayer, { Vocabulary } from '@/components/video/VideoPlayer';
import { notFound, redirect } from 'next/navigation';
import { getAuthSession } from '../../../../lib/server-auth';

const prisma = new PrismaClient();

// تابعی برای گرفتن اطلاعات کامل ویدیو (با ساختار جدید)
async function getVideoWithAllData(videoId: string) {
  try {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        title: true,
        videoUrl: true,
        thumbnailUrl: true,
        level: true,
        subtitlesVtt: true,
        vocabularies: true,
      },
    });
    return video;
  } catch (error) {
    console.error("Error fetching video:", error);
    return null;
  }
}

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
 
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const videoData = await getVideoWithAllData(id);

  if (!videoData) {
    notFound();
  }

  // تبدیل داده‌های لغت‌ها به تایپ مورد نیاز
  const vocabularies: Vocabulary[] = videoData.vocabularies.map(v => ({
    id: v.id,
    word: v.word,
    meaning: v.meaning,
  }));

  // کامپوننت VideoPlayer را با داده‌های جدید رندر کن
  return (
    <VideoPlayer
      videoUrl="/test-video.mp4"
      subtitleUrl="/text.vtt"
      
    />
  );
}