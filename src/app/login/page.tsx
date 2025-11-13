// src/app/login/page.tsx
import SignIn from "@/components/sign-in";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const LoginPage = () => {
  return (
    // Main container: تمام صفحه را می‌پوشاند و محتوا را عمودی و افقی وسط‌چین می‌کند
    <main className="flex flex-col items-center justify-center bg-background p-6">
      {/* یک گرادینت بسیار ملایم در پس‌زمینه برای ایجاد عمق بصری */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background to-muted/10"></div>

      {/* کارت اصلی: دارای حاشیه، سایه و پس‌زمینه تم‌دار */}
      <div className="relative z-10 w-full max-w-md rounded-lg border bg-card text-card-foreground shadow-sm">
        {/* بخش هدر: شامل عنوان و دکمه بازگشت */}
        <div className="flex flex-col space-y-1 p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">
              ورود به حساب
            </h1>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="بازگشت به صفحه اصلی"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          {/* توضیحات صفحه */}
          <p className="text-sm text-muted-foreground">
            برای ادامه، با حساب گوگل خود وارد شوید.
          </p>
        </div>

        {/* بخش فرم ورود: کامپوننت SignIn در اینجا قرار می‌گیرد */}
        <div className="p-8 pt-0">
          <SignIn />
        </div>
      </div>
    </main>
  );
};

export default LoginPage;