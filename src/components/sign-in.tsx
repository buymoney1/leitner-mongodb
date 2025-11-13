// components/sign-in.tsx
import { signIn } from "@/lib/auth";

export default function SignIn() {
  return (
    // Main container: تمام صفحه را می‌پوشاند و محتوا را عمودی و افقی وسط‌چین می‌کند
    <main className="relative flex flex-col items-center justify-center bg-background p-6">
      {/* پس‌زمینه متحرک و زیبا */}
      {/* کارت اصلی ورود: با افکت شیشه‌مورفیسم */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border/20 bg-background/80 shadow-2xl backdrop-blur-xl">
        {/* یک نوار رنگی در بالای کارت برای جذابیت بصری */}
        <div className="h-2 bg-gradient-to-r from-primary via-purple-500 to-pink-500"></div>

        <div className="flex flex-col space-y-1.5 p-8 pt-12">
          {/* بخش هدر: شامل لوگو، عنوان و توضیحات */}
          <div className="text-center">
            {/* می‌توانید یک لوگو یا آیکون زیبا اینجا قرار دهید */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-8 w-8 text-primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 6v12a3 3 0 1 0 3-3h6a3 3 0 0 1 3 3v6M10 6v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3z"
                />
              </svg>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              برای ادامه، با حساب گوگل خود وارد شوید.
            </p>
          </div>

          {/* فرم ورود با گوگل */}
          <form
            action={async () => {
              "use server";
              await signIn("google");
            }}
            className="mt-8"
          >
            <button
              type="submit"
              className="group cursor-pointer relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-lg border border-border bg-background px-6 py-3 text-sm font-medium text-foreground shadow-sm transition-all duration-300 hover:bg-accent hover:text-accent-foreground hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {/* افکت موجی روی دکمه در حالت hover */}
              <span className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
              
              {/* آیکون گوگل */}
              <svg
                className="relative z-10 h-5 w-5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>

              <span className="relative z-10">ورود با گوگل</span>
            </button>
          </form>

        </div>
      </div>
    </main>
  );
}