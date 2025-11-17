// app/videos/[id]/page.tsx

import { PrismaClient } from '@prisma/client';
import VideoPlayer, { Vocabulary } from '@/components/video/VideoPlayer'; // Subtitle دیگر نیازی به import نیست
import { notFound } from 'next/navigation';

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
        subtitlesVtt: true, // <--- فیلد جدید VTT را انتخاب کن
        vocabularies: true, // لغت‌های ویدیو را نیز دریافت کن
      },
    });
    return video;
  } catch (error) {
    console.error("Error fetching video:", error);
    return null;
  }
}

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const videoData = await getVideoWithAllData(id);

  if (!videoData) {
    notFound();
  }

  // تبدیل داده‌های لغت‌ها به تایپ مورد نیاز (این بخش بدون تغییر باقی می‌ماند)
  const vocabularies: Vocabulary[] = videoData.vocabularies.map(v => ({
    id: v.id,
    word: v.word,
    meaning: v.meaning,
  }));

  // کامپوننت VideoPlayer را با داده‌های جدید رندر کن
  return (
    <VideoPlayer
      videoUrl={videoData.videoUrl}
      subtitlesVtt={videoData.subtitlesVtt} // <--- prop صحیح را ارسال کن (رشته VTT)
      vocabularies={vocabularies}
    />
  );
}