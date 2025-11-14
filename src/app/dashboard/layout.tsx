// app/dashboard/layout.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma'; // <-- مهم: import کردن Prisma

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // 1. اگر کاربر لاگین نکرده بود، او را به صفحه لاگین بفرست
  if (!session?.user?.id) {
    redirect('/login');
  }

  // 2. گرفتن اطلاعات کاربر از دیتابیس برای بررسی رویبوردینگ
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isOnboardingComplete: true }, // فقط فیلد مورد نیاز را می‌خوانیم
  });

  // 3. اگر کاربر پیدا نشد یا رویبوردینگ را کامل نکرده بود، او را به صفحه رویبوردینگ بفرست
  if (!user || !user.isOnboardingComplete) {
    redirect('/onboarding');
  }

  // 4. در غیر این صورت، صفحه داشبورد را نمایش بده
  return <>{children}</>;
}