// app/videos/[id]/page.tsx
import { PrismaClient } from '@prisma/client';
import VideoPlayer, { Subtitle, Vocabulary } from '@/components/video/VideoPlayer';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

// تابعی برای گرفتن اطلاعات کامل ویدیو (زیرنویس‌ها و لغت‌ها)
async function getVideoWithAllData(videoId: string) {
  try {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        subtitles: {
          orderBy: { startTime: 'asc' },
        },
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
  // 1. params را await کنید
  const { id } = await params;

  const videoData = await getVideoWithAllData(id);

  // 2. اگر ویدیویی پیدا نشد، صفحه 404 را نمایش بده
  if (!videoData) {
    notFound();
  }

  // 3. تبدیل داده‌های Prisma به تایپ‌های مورد نیاز کامپوننت
  const subtitles: Subtitle[] = videoData.subtitles.map(s => ({
    id: s.id,
    startTime: s.startTime,
    endTime: s.endTime,
    englishText: s.englishText,
    persianText: s.persianText,
  }));

  // 4. تبدیل داده‌های لغت‌ها به تایپ مورد نیاز
  const vocabularies: Vocabulary[] = videoData.vocabularies.map(v => ({
    id: v.id,
    word: v.word,
    meaning: v.meaning,
  }));

  // 5. کامپوننت VideoPlayer را با تمام داده‌ها رندر کن
  // دیگر نیازی به تگ main و h1 نیست، چون VideoPlayer صفحه را کامل می‌گیرد
  return (
    <VideoPlayer
      videoUrl={videoData.videoUrl}
      subtitles={subtitles}
      vocabularies={vocabularies}
    />
  );
}