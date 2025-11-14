// app/login/layout.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // اگر کاربر قبلاً لاگین کرده بود، او را به داشبورد بفرست
  if (session) {
    redirect('/dashboard');
  }

  // در غیر این صورت، صفحه لاگین را نمایش بده
  return <>{children}</>;
}