// app/login/layout.tsx
import { redirect } from 'next/navigation';
import { getAuthSession } from '../../../lib/server-auth';


export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  // اگر کاربر قبلاً لاگین کرده بود، او را به داشبورد بفرست
  if (session) {
    redirect('/dashboard');
  }

  // در غیر این صورت، صفحه لاگین را نمایش بده
  return <>{children}</>;
}