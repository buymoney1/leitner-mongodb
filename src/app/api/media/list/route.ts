import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '../../../../../lib/server-auth';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const fileType = searchParams.get('fileType');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // ساخت شرط‌های فیلتر
    const where: any = {
      OR: [
        { uploaderId: session.user.id },
        { isPublic: true },
      ]
    };

    if (fileType) {
      where.fileType = fileType;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        ...(where.OR || []),
        { fileName: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    // گرفتن فایل‌ها
    const [files, total] = await Promise.all([
      prisma.mediaFile.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      }),
      prisma.mediaFile.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: files,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    });

  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت لیست فایل‌ها' },
      { status: 500 }
    );
  }
}