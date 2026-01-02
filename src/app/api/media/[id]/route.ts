//api/media/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parspackService } from '../../../../../lib/parspack';
import { getAuthSession } from '../../../../../lib/server-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id: params.id },
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!mediaFile) {
      return NextResponse.json(
        { error: 'فایل یافت نشد' },
        { status: 404 }
      );
    }

    // اگر فایل عمومی نیست، لینک موقت بساز
    let fileUrl = mediaFile.publicUrl;
    if (!mediaFile.isPublic) {
      if (!mediaFile.signedUrl || 
          !mediaFile.urlExpiresAt || 
          new Date(mediaFile.urlExpiresAt) < new Date()) {
        
        fileUrl = await parspackService.getFileUrl(mediaFile.storageKey);
        
        // ذخیره لینک جدید در دیتابیس
        await prisma.mediaFile.update({
          where: { id: mediaFile.id },
          data: {
            signedUrl: fileUrl,
            urlExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          }
        });
      } else {
        fileUrl = mediaFile.signedUrl;
      }
    }

    // افزایش تعداد بازدید
    await prisma.mediaFile.update({
      where: { id: mediaFile.id },
      data: {
        views: { increment: 1 },
        lastAccessedAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        ...mediaFile,
        fileUrl,
      },
    });

  } catch (error) {
    console.error('Get file error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت فایل' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id: params.id },
    });

    if (!mediaFile) {
      return NextResponse.json(
        { error: 'فایل یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی دسترسی
    if (mediaFile.uploaderId !== session.user.id) {
      return NextResponse.json(
        { error: 'شما مجوز حذف این فایل را ندارید' },
        { status: 403 }
      );
    }

    // حذف از پارس‌پک
    await parspackService.deleteFile(mediaFile.storageKey);

    // حذف از دیتابیس
    await prisma.mediaFile.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'فایل با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      { error: 'خطا در حذف فایل' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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


    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id: params.id },
    });

    if (!mediaFile) {
      return NextResponse.json(
        { error: 'فایل یافت نشد' },
        { status: 404 }
      );
    }

    if (mediaFile.uploaderId !== session.user.id) {
      return NextResponse.json(
        { error: 'شما مجوز ویرایش این فایل را ندارید' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { isPublic, tags, category } = body;

    const updatedFile = await prisma.mediaFile.update({
      where: { id: params.id },
      data: {
        isPublic,
        accessLevel: isPublic ? 'public' : 'private',
        tags: tags || mediaFile.tags,
        category: category || mediaFile.category,
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedFile,
      message: 'فایل با موفقیت ویرایش شد'
    });

  } catch (error) {
    console.error('Update file error:', error);
    return NextResponse.json(
      { error: 'خطا در ویرایش فایل' },
      { status: 500 }
    );
  }
}