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
  
      // گرفتن کل user بدون select
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });
  
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
  
      // فقط فیلدهای مورد نیاز را در خروجی بفرست
      const { id, name, email, image, learningGoal, targetScore, suggestedReviewTime, isOnboardingComplete } = user;
  
      return NextResponse.json({ id, name, email, image, learningGoal, targetScore, suggestedReviewTime, isOnboardingComplete });
  
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
  
      // Prisma برای MongoDB بعضی مواقع TypeScript را با فیلدهای Optional نمی‌شناسد
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          name,
          learningGoal,
          targetScore,
          suggestedReviewTime,
          isOnboardingComplete: true,
        } as unknown as any, // 👈 فریب TypeScript
      });
  
      return NextResponse.json(updatedUser);
  
    } catch (error) {
      console.error("Error updating user profile:", error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  