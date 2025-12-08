import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';
import { ObjectId } from 'mongodb';
import { getAuthSession } from '../../../../lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'لطفاً وارد شوید' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { activityType, contentId, duration, pathname } = body;

    // اعتبارسنجی داده‌ها
    if (!activityType || !duration) {
      return NextResponse.json(
        { success: false, message: 'داده‌های ناقص' },
        { status: 400 }
      );
    }

    // اعتبارسنجی contentId - باید ObjectId معتبر باشد یا null
    let validContentId = null;
    if (contentId) {
      try {
        // بررسی می‌کنیم آیا contentId یک ObjectId معتبر است
        if (ObjectId.isValid(contentId)) {
          validContentId = contentId;
        } else {
          console.warn('⚠️ contentId معتبر نیست:', contentId);
          // برای مسیرهایی مثل /dashboard/review که contentId ندارند، null می‌گذاریم
          validContentId = null;
        }
      } catch (error) {
        console.warn('⚠️ خطا در اعتبارسنجی contentId:', error);
        validContentId = null;
      }
    }

    console.log('📤 ثبت فعالیت:', {
      activityType,
      duration,
      contentId: validContentId,
      pathname
    });

    // ثبت فعالیت در ActivityTracking
    const activity = await prisma.activityTracking.create({
      data: {
        userId: session.user.id,
        activityType,
        contentId: validContentId, // استفاده از contentId معتبر یا null
        duration,
        pathname,
        isRegistered: false
      }
    });

    return NextResponse.json({
      success: true,
      data: activity,
      message: 'فعالیت ثبت شد'
    });

  } catch (error) {
    console.error('Error tracking activity:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطا در ثبت فعالیت',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}