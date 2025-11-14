import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-black via-[#0a0a0a] to-black px-6">
      
      {/* افکت نور پشت متن */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-3xl animate-pulse" />

      <div className="relative z-10 w-full max-w-3xl text-center">
        
        <h1 className="mb-6 text-5xl font-extrabold leading-tight sm:text-6xl lg:text-7xl bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
          به پلتفرم یادگیری ما خوش آمدید
        </h1>

        <p className="mb-10 text-lg text-gray-400 sm:text-xl">
          سریع، ساده و هوشمند یاد بگیر!  
          با سیستم لایتنر خودکار و تجربه‌ای مدرن در یادگیری لغات.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-10 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:scale-105 hover:shadow-blue-600/40"
          >
            ورود / ثبت‌نام
          </Link>

 
        </div>

      </div>
    </main>
  );
}
