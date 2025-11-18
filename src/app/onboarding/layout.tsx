// app/onboarding/layout.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

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


  
return <>{children}</>;
}