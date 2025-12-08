import { NextRequest, NextResponse } from 'next/server';

import {prisma} from '@/lib/prisma';
import { getAuthSession } from '../../../../lib/server-auth';


export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const artist = searchParams.get('artist');
    
    let whereClause: any = { isPublished: true };
    
    if (artist) {
      whereClause.artist = { contains: artist, mode: 'insensitive' };
    }

    const songs = await prisma.song.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            name: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json({ songs });
  } catch (error) {
    console.error('Error fetching songs:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت آهنگ‌ها' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    const song = await prisma.song.create({
      data: {
        title: body.title,
        artist: body.artist,
        album: body.album,
        duration: body.duration,
        audioUrl: body.audioUrl,
        coverUrl: body.coverUrl,
        lyrics: body.lyrics,
        isPublished: body.isPublished,
        createdById: user.id
      }
    });

    return NextResponse.json({ song }, { status: 201 });
  } catch (error) {
    console.error('Error creating song:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد آهنگ' },
      { status: 500 }
    );
  }
}