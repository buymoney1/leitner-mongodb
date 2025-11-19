// app/onboarding/layout.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // اگر کاربر لاگین نکرده بود، او را به صفحه لاگین بفرست
  if (!session) {
    redirect('/login');
  }

  // چک کردن وضعیت onboarding کاربر
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      isOnboardingComplete: true,
    },
  });

if (user && user.isOnboardingComplete) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}