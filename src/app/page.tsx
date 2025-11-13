// app/page.tsx

import Link from "next/link";

export default function HomePage() {
  return (
    // Main container for the whole page
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background p-6">
      {/* A subtle background gradient for a modern look */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background to-muted/10"></div>

      {/* Content wrapper to control max-width and centering */}
      <div className="z-10 w-full max-w-3xl text-center">
        {/* Main heading with a gradient effect */}
        <h1 className="mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-5xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">
          به پلتفرم ما خوش آمدید
        </h1>

        {/* Subtitle with muted color */}
        <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
          یک راه حل مدرن، سریع و امن برای مدیریت نیازهای شما. همین امروز شروع کنید و تفاوت را احساس کنید.
        </p>

        {/* Call-to-Action buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard" // فرض می‌کنیم یک صفحه داشبورد دارید
            className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-all duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            شروع کنید
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium shadow-sm transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            بیشتر بدانید
          </Link>
        </div>
      </div>
    </main>
  );
}