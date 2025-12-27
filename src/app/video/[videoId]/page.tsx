// app/video/[videoId]/page.tsx
import { PrismaClient } from '@prisma/client';
import { notFound, redirect } from 'next/navigation';
import { getAuthSession } from '../../../../lib/server-auth';
import VideoPlayerClient from '@/components/video/VideoPlayerClient';

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

    return <VideoPlayerClient initialVideoData={videoData} />;
  } catch (error) {
    console.error('Error loading video:', error);
    notFound();
  }
}