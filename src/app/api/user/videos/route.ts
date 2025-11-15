// app/api/user/videos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth"; // <-- از lib/auth ایمپورت می‌کنیم
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// این تابع ویدیوهای اخیر و ویدیوهای سطح A1 را برمی‌گرداند
export async function GET(req: NextRequest) {
  // استفاده از auth() به جای getServerSession
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const recentVideos = await prisma.video.findMany({
      orderBy: { createdAt: 'desc' },
      take: 4, // ۴ ویدیوی آخر
      select: {
        id: true,
        title: true,
        thumbnailUrl: true,
      },
    });

    const a1Videos = await prisma.video.findMany({
      where: { level: 'A1' },
      orderBy: { createdAt: 'desc' },
      take: 4, // ۴ ویدیوی آخر سطح A1
      select: {
        id: true,
        title: true,
        thumbnailUrl: true,
      },
    });

    return NextResponse.json({ recentVideos, a1Videos });
  } catch (error) {
    console.error('Failed to fetch videos:', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}