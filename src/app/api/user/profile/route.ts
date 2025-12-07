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
      suggestedReviewTime 
    } = body;

    // اعتبارسنجی فیلدهای ضروری
    if (!name || !learningGoal || !suggestedReviewTime) {
      return NextResponse.json(
        { error: 'Name, learning goal, and review time are required' },
        { status: 400 }
      );
    }

    // آماده کردن داده برای آپدیت
    const updateData: any = {
      name: name.trim(),
      learningGoal,
      suggestedReviewTime,
      isOnboardingComplete: true,
      updatedAt: new Date(),
      targetScore: null, // حذف نمره هدف
    };

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
        suggestedReviewTime: true,
        isOnboardingComplete: true,
  
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