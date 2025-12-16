import {prisma} from '@/lib/prisma';

export async function processUserActivities(userId: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/planner/process-activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    return await response.json();
  } catch (error) {
    console.error(`Error processing activities for user ${userId}:`, error);
    return null;
  }
}

// تابع برای پردازش فعالیت‌های همه کاربران (اجرای دوره‌ای)
export async function processAllPendingActivities() {
  try {
    // کاربرانی که امروز فعالیت ثبت نشده دارند
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usersWithActivities = await prisma.user.findMany({
      where: {
        activityTrackings: {
          some: {
            isRegistered: false,
            createdAt: { gte: today }
          }
        }
      },
      select: { id: true }
    });

    for (const user of usersWithActivities) {
      await processUserActivities(user.id);
    }
    
    return { processed: usersWithActivities.length };
  } catch (error) {
    console.error('Error processing all activities:', error);
    
    // بررسی نوع error
    if (error instanceof Error) {
      return { processed: 0, error: error.message };
    } else {
      return { processed: 0, error: 'Unknown error occurred' };
    }
  }
}