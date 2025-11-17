// app/api/admin/upload-video/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;

  if (!session || !session.user || userRole !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, videoUrl, thumbnailUrl, level, subtitles, vocabularies } = body;

    if (!title || !videoUrl || !level) {
      return NextResponse.json({ error: 'Missing required fields: title, videoUrl, level' }, { status: 400 });
    }

    // ایجاد ویدیو با ذخیره مستقیم محتوای VTT
    const newVideo = await prisma.video.create({
      data: {
        title,
        videoUrl,
        thumbnailUrl,
        level,
        subtitlesVtt: subtitles, // <-- محتوای VTT خام مستقیماً ذخیره می‌شود
      },
    });

    // ایجاد لغت‌ها برای ویدیو
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