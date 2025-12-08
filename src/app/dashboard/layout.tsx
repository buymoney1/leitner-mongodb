// app/dashboard/layout.tsx
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getAuthSession } from '../../../lib/server-auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. گرفتن اطلاعات جلسه
  const session = await getAuthSession();

  // 2. اگر کاربر لاگین نکرده بود، او را به صفحه لاگین بفرست
  if (!session?.user?.id) {
    redirect('/login');
  }

  // 3. گرفتن اطلاعات کامل کاربر از دیتابیس
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  // 4. اگر کاربر پیدا نشد یا رویبوردینگ را کامل نکرده بود، او را به صفحه رویبوردینگ بفرست
  if (!user || !user.isOnboardingComplete) {
    redirect('/onboarding');
  }

  // 5. در غیر این صورت، صفحه داشبورد را نمایش بده
  return <>{children}</>;
}
