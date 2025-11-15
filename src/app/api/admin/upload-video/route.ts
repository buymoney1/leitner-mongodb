// app/api/admin/upload-video/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth"; // <-- 1. از lib/auth ایمپورت کنید
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  // 2. از auth() به جای getServerSession استفاده کنید
  const session = await auth();

  // 3. بررسی نقش کاربر (با فرض اینکه callback را در lib/auth.ts تنظیم کرده‌اید)
  // اگر callback را تنظیم نکرده‌اید، باید نقش را از دیتابیس بخوانید
  const userRole = (session?.user as any)?.role;

  if (!session || !session.user || userRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, videoUrl, thumbnailUrl, level, subtitles, vocabularies } = body;
    if (!title || !videoUrl || !level || !subtitles) {
      return NextResponse.json({ error: 'Missing required fields: title, videoUrl, level, subtitles' }, { status: 400 });
    }

    // ایجاد ویدیو
    const newVideo = await prisma.video.create({
      data: {
        title,
        videoUrl,
        thumbnailUrl,
        level,
      },
    });

    // ایجاد زیرنویس‌ها برای ویدیو
    if (subtitles && subtitles.length > 0) {
      await prisma.videoSubtitle.createMany({
        data: subtitles.map((sub: any) => ({
          ...sub,
          videoId: newVideo.id,
        })),
      });
    }


    if (vocabularies && vocabularies.length > 0) {
      await prisma.videoVocabulary.createMany({
        data: vocabularies.map((vocab: any) => ({
          ...vocab,
          videoId: newVideo.id,
        })),
      });
    }
    

    return NextResponse.json({ success: true, videoId: newVideo.id });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Failed to upload video' }, { status: 500 });
  }
}