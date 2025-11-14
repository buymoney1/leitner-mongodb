// src/app/login/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

import SignIn from "@/components/sign-in";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function LoginPage() {
  const session = await auth();

  // اگر کاربر قبلاً لاگین کرده → بفرستش داشبورد
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-gray-900 p-6">
      {/* گرادینت ملایم در پس‌زمینه */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gray-900 to-gray-800/50"></div>

      {/* کارت اصلی */}
      <div className="relative z-10 w-full max-w-md rounded-lg border border-gray-700 bg-gray-800 text-white shadow-lg">
        {/* هدر */}
        <div className="flex flex-col space-y-1 p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">
              ورود به حساب
            </h1>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              aria-label="بازگشت به صفحه اصلی"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          <p className="text-sm text-gray-400">
            برای ادامه، با حساب گوگل خود وارد شوید.
          </p>
        </div>

        {/* فرم ورود */}
        <div className="p-8 pt-0">
          <SignIn />
        </div>
      </div>
    </main>
  );
}
