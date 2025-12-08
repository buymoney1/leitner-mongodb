import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '../../../../../../lib/server-auth';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

// GET - دریافت جزئیات مقاله برای ویرایش
export async function GET(request: Request, { params }: Params) {
  try {
    const session = await getAuthSession();
    const { id } = await params;

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        vocabularies: {
          orderBy: { paragraph: 'asc' }
        },
        createdBy: {
          select: { name: true, email: true }
        }
      }
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(article);

  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH - ویرایش مقاله
export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await getAuthSession();
    const { id } = await params;

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      coverUrl,
      level,
      readingTime,
      vocabularies,
      isPublished
    } = body;

    // ابتدا مقاله موجود را پیدا کن
    const existingArticle = await prisma.article.findUnique({
      where: { id },
      include: { vocabularies: true }
    });

    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // آپدیت مقاله
    const updatedArticle = await prisma.article.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(excerpt !== undefined && { excerpt }),
        ...(coverUrl !== undefined && { coverUrl }),
        ...(level && { level }),
        ...(readingTime !== undefined && { readingTime: readingTime ? parseInt(readingTime) : null }),
        ...(isPublished !== undefined && { isPublished }),
        vocabularies: {
          deleteMany: {}, // حذف تمام لغات قبلی
          create: vocabularies?.map((vocab: any) => ({
            word: vocab.word,
            meaning: vocab.meaning,
            paragraph: vocab.paragraph ? parseInt(vocab.paragraph) : null
          })) || []
        }
      },
      include: {
        vocabularies: true,
        createdBy: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      article: updatedArticle,
      message: 'مقاله با موفقیت ویرایش شد'
    });

  } catch (error: any) {
    console.error('Error updating article:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE - حذف مقاله
export async function DELETE(request: Request, { params }: Params) {
  try {
    const session = await getAuthSession();
    const { id } = await params;

    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.article.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'مقاله با موفقیت حذف شد'
    });

  } catch (error: any) {
    console.error('Error deleting article:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}