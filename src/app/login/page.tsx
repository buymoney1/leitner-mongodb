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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white dark:bg-black p-4 transition-colors duration-300">
      {/* افکت‌های پس‌زمینه */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-[#050505] dark:via-[#0A0A0A] dark:to-black"></div>
      
      {/* افکت‌های نئونی */}
      <div className="absolute top-1/4 -left-10 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-10 w-72 h-72 bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 dark:bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>

      {/* خطوط شبکه‌ای */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>


      {/* کارت اصلی */}
      <div className="relative z-10 w-full max-w-md">
        {/* کارت لاگین */}
        <div className="rounded-2xl border border-gray-300 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 bg-gradient-to-b from-white/90 to-white/60 dark:from-gray-900/80 dark:to-gray-900/40 backdrop-blur-xl shadow-2xl shadow-black/10 dark:shadow-black/50 overflow-hidden transition-colors duration-300">
          {/* هدر */}
          <div className="relative p-8 pb-6">
            {/* افکت بالای کارت */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
            
            <div className="text-center">
              {/* آیکون */}
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-500/30">
                <div className="text-2xl">👋</div>
              </div>

              <h1 className="mb-3 text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                خوش آمدید
              </h1>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                برای دسترسی به پلتفرم پیشرفته یادگیری زبان، 
                با حساب گوگل خود وارد شوید
              </p>
            </div>
          </div>

          {/* بخش فرم */}
          <div className="p-8 pt-6">
            <div className="space-y-6">
              <SignIn />
              
              {/* اطلاعات اضافی */}
              <div className="rounded-xl bg-gray-100 dark:bg-gray-800/30 p-4 border border-gray-200 dark:border-gray-800/50 transition-colors duration-300">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-500/20">
                    <svg className="h-3 w-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      ورود امن و سریع با گوگل
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* فوتر */}
          <div className="border-t border-gray-200 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/20 p-4 transition-colors duration-300">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-500">
                با ورود، با{" "}
                <Link href="/login" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors underline">
                  شرایط استفاده
                </Link>{" "}
                و{" "}
                <Link href="/login" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors underline">
                  حریم خصوصی
                </Link>{" "}
                موافقت می‌کنید
              </p>
            </div>
          </div>
        </div>

        {/* اطلاعات پلتفرم */}
        <div className="mt-8 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-500">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
              <span>یادگیری از طریق فیلم</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
              <span>هوش مصنوعی پیشرفته</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-pink-500"></div>
              <span>فلش‌کارت هوشمند</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}