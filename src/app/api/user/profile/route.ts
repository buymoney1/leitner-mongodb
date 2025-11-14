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
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, learningGoal, targetScore, suggestedReviewTime } = await request.json();

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        learningGoal,
        targetScore,
        suggestedReviewTime,
        isOnboardingComplete: true, // وقتی این فرم ارسال شد، یعنی رویبوردینگ کامل شده
      },
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}