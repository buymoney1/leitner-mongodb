// lib/services/user.service.ts
import { prisma } from '@/lib/prisma';

export async function updateUserProfile(
  userId: string, 
  data: any
) {
  // 1. پاکسازی داده‌ها - حذف فیلدهای ممنوعه
  const sanitizedData = { ...data };
  
  const forbiddenFields = [
    'id',
    'createdAt',
    'updatedAt',
    'emailVerified',
    'role',
    'accounts',
    'sessions'
  ];
  
  forbiddenFields.forEach(field => {
    delete sanitizedData[field];
  });
  
  // 2. آپدیت کاربر
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: sanitizedData,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      learningGoal: true,
      targetScore: true,
      suggestedReviewTime: true,
      isOnboardingComplete: true,
      notificationEnabled: true,
    }
  });
  
  return updatedUser;
}