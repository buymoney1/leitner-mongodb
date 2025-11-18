// app/api/translate/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  const target = searchParams.get('target') || 'fa';

  if (!text) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 });
  }

  try {
    // استفاده از یک پروکسی ساده برای Google Translate
    const response = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${target}&dt=t&q=${encodeURIComponent(text)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // ساختار پاسخ Google Translate: [[["ترجمه", "متن اصلی", null, null]], null, "en"]
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return NextResponse.json({
        translatedText: data[0][0][0]
      });
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error('Translation error:', error);
    
    // در صورت خطا، متن اصلی را برگردان
    return NextResponse.json({
      translatedText: text
    });
  }
}