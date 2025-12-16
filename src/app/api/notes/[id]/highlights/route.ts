// app/api/notes/[id]/highlights/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getAuthSession } from '../../../../../../lib/server-auth';

interface Highlight {
  id: string;
  text: string;
  start: number;
  end: number;
  color: string;
}

// تابع کمکی برای بررسی اینکه آیا داده Highlight معتبر است یا نه
function isValidHighlight(data: any): data is Highlight {
  return (
    data &&
    typeof data.id === 'string' &&
    typeof data.text === 'string' &&
    typeof data.start === 'number' &&
    typeof data.end === 'number' &&
    typeof data.color === 'string'
  );
}

// تابع کمکی برای تبدیل highlights از JSON به آرایه Highlight
function parseHighlights(highlights: any): Highlight[] {
  if (!Array.isArray(highlights)) {
    return [];
  }
  
  return highlights.filter((item): item is Highlight => isValidHighlight(item));
}

// تابع کمکی برای تبدیل آرایه Highlight به JsonValue قابل ذخیره در Prisma
function toJsonValue(highlights: Highlight[]): Prisma.JsonValue {
  return highlights as unknown as Prisma.JsonValue;
}

// Handler برای POST (افزودن هایلایت جدید)
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // استفاده از await برای دریافت params
    const { id } = await context.params;
    const body = await req.json();
    const { text, start, end, color } = body;

    // اعتبارسنجی داده‌های ورودی
    if (!text || typeof start !== 'number' || typeof end !== 'number') {
      return NextResponse.json(
        { error: 'Invalid highlight data' },
        { status: 400 }
      );
    }

    const note = await prisma.note.findUnique({
      where: {
        id: id,
        userId: session.user.id
      }
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // ایجاد ID جدید برای هایلایت
    const newHighlight: Highlight = {
      id: crypto.randomUUID(),
      text,
      start,
      end,
      color: color || '#FFEB3B'
    };

    // به‌روزرسانی هایلایت‌ها
    const existingHighlights = parseHighlights(note.highlights);
    const updatedHighlights = [...existingHighlights, newHighlight];

    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        highlights: toJsonValue(updatedHighlights)
      }
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Error adding highlight:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handler برای DELETE (حذف هایلایت)
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const highlightId = searchParams.get('highlightId');

    if (!highlightId) {
      return NextResponse.json(
        { error: 'highlightId is required' },
        { status: 400 }
      );
    }

    const note = await prisma.note.findUnique({
      where: {
        id,
        userId: session.user.id
      }
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const existingHighlights = parseHighlights(note.highlights);
    const filteredHighlights = existingHighlights.filter(
      (h) => h.id !== highlightId
    );

    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        highlights: toJsonValue(filteredHighlights)
      }
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Error removing highlight:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handler برای PUT (به‌روزرسانی کلی هایلایت‌ها)
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await req.json();
    const { highlights } = body;

    const note = await prisma.note.findUnique({
      where: {
        id,
        userId: session.user.id
      }
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // اعتبارسنجی آرایه highlights دریافتی
    let validatedHighlights: Highlight[] = [];
    
    if (Array.isArray(highlights)) {
      validatedHighlights = highlights.filter((item): item is Highlight => 
        isValidHighlight(item)
      );
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        highlights: toJsonValue(validatedHighlights)
      }
    });

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Error updating highlights:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}