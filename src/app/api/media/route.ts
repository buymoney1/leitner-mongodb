import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '../../../../lib/server-auth';
import { parspackService } from '../../../../lib/parspack';


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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const isPublic = formData.get('isPublic') === 'true';
    const tags = formData.get('tags') as string;
    const category = formData.get('category') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'هیچ فایلی انتخاب نشده است' },
        { status: 400 }
      );
    }

    // خواندن فایل
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // آپلود به پارس‌پک
    const uploadResult = await parspackService.uploadFile(
      buffer,
      file.name,
      isPublic
    );

    // ذخیره در دیتابیس
    const mediaFile = await prisma.mediaFile.create({
      data: {
        fileName: uploadResult.fileName,
        originalName: file.name,
        fileType: uploadResult.mimeType.split('/')[0],
        mimeType: uploadResult.mimeType,
        fileSize: uploadResult.fileSize,
        fileSizeMB: parseFloat((uploadResult.fileSize / (1024 * 1024)).toFixed(2)),
        storageKey: uploadResult.storageKey,
        publicUrl: uploadResult.publicUrl,
        isPublic,
        accessLevel: isPublic ? 'public' : 'private',
        uploaderId: session.user.id,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        category: category || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: mediaFile,
      message: 'فایل با موفقیت آپلود شد'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: 'خطا در آپلود فایل',
        details: error instanceof Error ? error.message : 'خطای ناشناخته'
      },
      { status: 500 }
    );
  }
}