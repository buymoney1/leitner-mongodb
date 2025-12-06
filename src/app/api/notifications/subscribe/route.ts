// app/api/notifications/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  console.log('📨 درخواست POST دریافت شد');
  
  try {
    const body = await request.json();
    console.log('📝 Body دریافت شده:', JSON.stringify(body, null, 2));
    
    const { subscription, userId } = body;
    
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
        userId
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

    // اگر userId نداریم، از یک کاربر تست استفاده کنیم
    let finalUserId = userId;
    if (!finalUserId) {
      console.log('👤 userId ندارد، در حال پیدا کردن کاربر اول...');
      const firstUser = await prisma.user.findFirst();
      if (firstUser) {
        finalUserId = firstUser.id;
        console.log(`✅ کاربر یافت شد: ${firstUser.email}`);
      } else {
        console.log('👤 کاربری یافت نشد، ایجاد کاربر تست...');
        const testUser = await prisma.user.create({
          data: {
            email: 'test@example.com',
            name: 'کاربر تست',
            notificationEnabled: true,
          }
        });
        finalUserId = testUser.id;
      }
    }

    // بررسی duplicate
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint: subData.endpoint },
    });

    if (existing) {
      console.log('🔄 آپدیت subscription موجود');
      await prisma.pushSubscription.update({
        where: { endpoint: subData.endpoint },
        data: {
          keys: subData.keys,
          updatedAt: new Date(),
        },
      });
    } else {
      console.log('🆕 ایجاد subscription جدید');
      await prisma.pushSubscription.create({
        data: {
          userId: finalUserId,
          endpoint: subData.endpoint,
          keys: subData.keys,
        },
      });
    }

    // آپدیت کاربر
    await prisma.user.update({
      where: { id: finalUserId },
      data: {
        notificationEnabled: true,
        notificationToken: subData.endpoint,
      },
    });

    console.log('✅ subscription ذخیره شد');
    
    return NextResponse.json({ 
      success: true,
      message: 'Subscription ذخیره شد',
      userId: finalUserId,
      endpoint: subData.endpoint.substring(0, 50) + '...',
    });
    
  } catch (error) {
    console.error('❌ خطا در ثبت subscription:', error);
    return NextResponse.json(
      { 
        error: 'خطا در ثبت subscription',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    console.log(`📊 تعداد subscriptions: ${subscriptions.length}`);
    
    return NextResponse.json({
      count: subscriptions.length,
      subscriptions: subscriptions.map(sub => ({
        id: sub.id,
        endpoint: sub.endpoint,
        user: sub.user,
        createdAt: sub.createdAt,
      })),
    });
  } catch (error) {
    console.error('❌ خطا در دریافت subscriptions:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت subscriptions' },
      { status: 500 }
    );
  }
}