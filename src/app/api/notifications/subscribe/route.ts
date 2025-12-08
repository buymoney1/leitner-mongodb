// app/api/notifications/subscribe/route.ts - نسخه اصلاح شده
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthSession } from '../../../../../lib/server-auth';


const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  console.log('📨 درخواست POST دریافت شد');
  
  try {
    // دریافت session از سرور
    const session = await getAuthSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log('📝 Body دریافت شده:', JSON.stringify(body, null, 2));
    
    const { subscription } = body;
    
    if (!subscription) {
      console.error('❌ subscription موجود نیست');
      return NextResponse.json(
        { error: 'اطلاعات ناقص است - subscription مورد نیاز است' },
        { status: 400 }
      );
    }

    let subData;
    try {
      subData = JSON.parse(subscription);
      console.log('✅ subscription پارس شد:', {
        endpoint: subData.endpoint,
        hasKeys: !!subData.keys,
        email: session.user.email
      });
    } catch (parseError) {
      console.error('❌ خطا در پارس subscription:', parseError);
      return NextResponse.json(
        { error: 'فرمت subscription نامعتبر است' },
        { status: 400 }
      );
    }

    // بررسی endpoint
    if (!subData.endpoint) {
      console.error('❌ endpoint موجود نیست');
      return NextResponse.json(
        { error: 'Endpoint مورد نیاز است' },
        { status: 400 }
      );
    }

    // بررسی keys
    if (!subData.keys || !subData.keys.p256dh || !subData.keys.auth) {
      console.error('❌ keys کامل نیست:', subData.keys);
      return NextResponse.json(
        { error: 'Keys کامل نیست' },
        { status: 400 }
      );
    }

    // یافتن کاربر بر اساس ایمیل
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.error(`❌ کاربر با ایمیل ${session.user.email} یافت نشد`);
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    // بررسی duplicate endpoint
    const existingSubscription = await prisma.pushSubscription.findUnique({
      where: { endpoint: subData.endpoint },
    });

    if (existingSubscription) {
      console.log('🔄 آپدیت subscription موجود');
      await prisma.pushSubscription.update({
        where: { endpoint: subData.endpoint },
        data: {
          userId: user.id,
          keys: subData.keys,
          updatedAt: new Date(),
        },
      });
    } else {
      console.log('🆕 ایجاد subscription جدید');
      await prisma.pushSubscription.create({
        data: {
          userId: user.id,
          endpoint: subData.endpoint,
          keys: subData.keys,
        },
      });
    }

    // آپدیت کاربر برای فعال‌سازی نوتیفیکیشن
    await prisma.user.update({
      where: { id: user.id },
      data: {
        notificationEnabled: true,
        notificationToken: subData.endpoint,
      },
    });

    console.log('✅ subscription ذخیره شد برای کاربر:', user.email);
    
    return NextResponse.json({ 
      success: true,
      message: 'نوتیفیکیشن‌ها فعال شدند',
      user: {
        email: user.email,
        name: user.name,
        notificationEnabled: true,
      },
      subscription: {
        endpoint: subData.endpoint.substring(0, 50) + '...',
        savedAt: new Date().toISOString(),
      }
    });
    
  } catch (error) {
    console.error('❌ خطا در ثبت subscription:', error);
    
    // نمایش جزئیات بیشتر خطا
    let errorMessage = 'خطای نامشخص';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('🔍 جزئیات خطا:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'خطا در ثبت نوتیفیکیشن',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        pushSubscriptions: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    console.log(`📊 تعداد subscriptions برای ${user.email}: ${user.pushSubscriptions.length}`);
    
    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        notificationEnabled: user.notificationEnabled,
      },
      subscriptions: user.pushSubscriptions.map(sub => ({
        id: sub.id,
        endpoint: sub.endpoint,
        createdAt: sub.createdAt,
      })),
      total: user.pushSubscriptions.length,
    });
  } catch (error) {
    console.error('❌ خطا در دریافت subscriptions:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت subscriptions' },
      { status: 500 }
    );
  }
}