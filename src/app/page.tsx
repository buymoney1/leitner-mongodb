// app/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();

  // اگر کاربر لاگین کرده بود، او را به داشبورد هدایت کن
  if (session) {
    redirect("/dashboard");
  }

  // اگر کاربر لاگین نکرده بود، صفحه اصلی (صفحه لندینگ) را نمایش بده
  return (
    <main className="flex  flex-col items-center justify-center bg-background p-6">
      <div className="z-10 w-full max-w-3xl text-center">
        <h1 className="mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-5xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">
          به پلتفرم ما خوش آمدید
        </h1>

        <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
          یک راه حل مدرن، سریع و امن برای مدیریت نیازهای شما. همین امروز شروع کنید و تفاوت را احساس کنید.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-all duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            ورود / ثبت‌نام
          </Link>
        </div>
      </div>
    </main>
  );
}