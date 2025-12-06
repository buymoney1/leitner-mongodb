// app/api/cron/nightly-reminder/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 });
  }

  try {
    // صدا زدن endpoint ارسال نوتیفیکیشن
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/send-nightly`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CRON_SECRET}`,
        },
      }
    );

    const result = await response.json();

    return NextResponse.json({
      success: true,
      cronResult: result,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'خطا در اجرای cron job' },
      { status: 500 }
    );
  }
}