// api/podcasts/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// پارامترها به صورت Promise تعریف می‌شوند
interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // await کردن params قبل از استفاده
    const { id } = await params;
    
    const podcast = await prisma.podcast.findUnique({
      where: { id }, // استفاده از id بعد از await
      include: {
        vocabularies: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (!podcast) {
      return NextResponse.json(
        { error: 'Podcast not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(podcast);

  } catch (error) {
    console.error('Error fetching podcast:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}