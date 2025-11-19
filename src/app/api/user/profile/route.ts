// src/app/api/user/profile/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        learningGoal: true,
        targetScore: true,
        suggestedReviewTime: true,
        isOnboardingComplete: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      name, 
      learningGoal, 
      targetScore, 
      suggestedReviewTime 
    } = body;

    // اعتبارسنجی فیلدهای ضروری
    if (!name || !learningGoal || !suggestedReviewTime) {
      return NextResponse.json(
        { error: 'Name, learning goal, and review time are required' },
        { status: 400 }
      );
    }

    // اعتبارسنجی targetScore برای IELTS و TOEFL
    if (learningGoal === 'IELTS' || learningGoal === 'TOEFL') {
      if (!targetScore) {
        return NextResponse.json(
          { error: 'Target score is required for IELTS/TOEFL goals' },
          { status: 400 }
        );
      }

      const score = parseFloat(targetScore);
      if (learningGoal === 'IELTS' && (score < 0 || score > 9)) {
        return NextResponse.json(
          { error: 'IELTS score must be between 0 and 9' },
          { status: 400 }
        );
      }

      if (learningGoal === 'TOEFL' && (score < 0 || score > 120)) {
        return NextResponse.json(
          { error: 'TOEFL score must be between 0 and 120' },
          { status: 400 }
        );
      }
    }

    // آماده کردن داده برای آپدیت
    const updateData: any = {
      name: name.trim(),
      learningGoal,
      suggestedReviewTime,
      isOnboardingComplete: true,
      updatedAt: new Date(),
    };

    // فقط اگر targetScore وجود داشت اضافه کن
    if (targetScore) {
      updateData.targetScore = parseFloat(targetScore);
    } else {
      updateData.targetScore = null;
    }

    // آپدیت کاربر
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        learningGoal: true,
        targetScore: true,
        suggestedReviewTime: true,
        isOnboardingComplete: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully'
    });

  } catch (error: any) {
    console.error("Error updating user profile:", error);

    // خطاهای خاص Prisma
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'User already exists with this data' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}