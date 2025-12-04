import { NextRequest, NextResponse } from 'next/server';

import {prisma} from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const song = await prisma.song.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            name: true,
            image: true
          }
        }
      }
    });

    if (!song) {
      return NextResponse.json(
        { error: 'آهنگ یافت نشد' },
        { status: 404 }
      );
    }

    return NextResponse.json({ song });
  } catch (error) {
    console.error('Error fetching song:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت آهنگ' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

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
    
    const song = await prisma.song.update({
      where: { id: params.id },
      data: {
        title: body.title,
        artist: body.artist,
        album: body.album,
        duration: body.duration,
        audioUrl: body.audioUrl,
        coverUrl: body.coverUrl,
        lyrics: body.lyrics,
        isPublished: body.isPublished
      }
    });

    return NextResponse.json({ song });
  } catch (error) {
    console.error('Error updating song:', error);
    return NextResponse.json(
      { error: 'خطا در به‌روزرسانی آهنگ' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

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

    await prisma.song.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'آهنگ با موفقیت حذف شد' });
  } catch (error) {
    console.error('Error deleting song:', error);
    return NextResponse.json(
      { error: 'خطا در حذف آهنگ' },
      { status: 500 }
    );
  }
}