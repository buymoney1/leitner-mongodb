"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BookOpen, Notebook, User2, Brain, Plus, Play, 
  Map, FileText, Trash2, Mic, Music, User 
} from "lucide-react";
import SimpleQuickStats from "./SimpleQuickStats";

interface Stats {
  totalCards: number;
  dueCards: number;
  retentionRate: number;
  streak: number;
}

interface DashboardClientProps {
  userName: string;
  userRole: string;
}

// تعریف تایپ برای اکشن‌ها جهت جلوگیری از تکرار و افزایش خوانایی
type ActionItem = {
  href: string;
  icon: any;
  label: string;
  description: string;
  colorTheme: string; 
};

export function DashboardClient({ userName, userRole }: DashboardClientProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (userRole === "admin") setIsAdmin(true);
  }, [userRole]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, videosRes] = await Promise.all([
          fetch("/api/user/stats"),
          fetch("/api/user/videos"),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        // ویدیوها در این نسخه نمایشی استفاده نشدند، اما بارگذاری می‌شوند
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // دیتای اکشن‌ها با ساختار بهینه‌تر
  const baseActions: ActionItem[] = [
    { href: "/profile", icon: User2, label: "پروفایل", description: "تنظیمات کاربری", colorTheme: "lime" },
    { href: "/journey", icon: Map, label: "سفر یادگیری", description: "مسیر پیشرفت", colorTheme: "rose" },
    { href: "/planner", icon: Map, label: "آمار یادگیری", description: "دستیار هوشمند", colorTheme: "amber" },
    { href: "/video-levels", icon: Play, label: "فیلم و سریال", description: "یادگیری تصویری", colorTheme: "sky" },
    { href: "/songs", icon: Music, label: "آهنگ‌", description: "گوش کردن و یادگیری", colorTheme: "emerald" },
    { href: "/podcasts", icon: Mic, label: "پادکست", description: "یادگیری در حرکت", colorTheme: "violet" },
    { href: "/articles", icon: FileText, label: "مقاله", description: "مطالعه عمیق", colorTheme: "indigo" },
    { href: "/dashboard/review", icon: Brain, label: "جعبه لایتنر", description: `${stats?.dueCards || 0} کارت مرور`, colorTheme: "orange" },
    { href: "/notes", icon: Notebook, label: "یادداشت‌", description: "نتایج شما", colorTheme: "teal" },
    { href: "/books", icon: BookOpen, label: "کتابخانه", description: "منابع درسی", colorTheme: "fuchsia" },
    { href: "/add-card", icon: Plus, label: "افزودن کارت", description: "ایجاد جدید", colorTheme: "cyan" },
    { href: "/dashboard/cards", icon: Trash2, label: "مدیریت کارت‌ها", description: "ویرایش و حذف", colorTheme: "red" },
  ];

  const adminActions: ActionItem[] = [
    { href: "/admin/users", icon: User, label: "مدیریت کاربران", description: "پنل ادمین", colorTheme: "blue" },
  ];

  const actions = isAdmin ? [...baseActions, ...adminActions] : baseActions;

  // نگاشت رنگ‌ها برای جلوگیری از کپی کد شدن در JSX
  const getColorStyles = (theme: string) => {
    const colors: Record<string, { border: string; bg: string; text: string; iconBg: string }> = {
      lime: { border: "border-lime-500/20", bg: "bg-lime-500/5", text: "text-lime-600 dark:text-lime-400", iconBg: "bg-lime-500/10" },
      rose: { border: "border-rose-500/20", bg: "bg-rose-500/5", text: "text-rose-600 dark:text-rose-400", iconBg: "bg-rose-500/10" },
      amber: { border: "border-amber-500/20", bg: "bg-amber-500/5", text: "text-amber-600 dark:text-amber-400", iconBg: "bg-amber-500/10" },
      sky: { border: "border-sky-500/20", bg: "bg-sky-500/5", text: "text-sky-600 dark:text-sky-400", iconBg: "bg-sky-500/10" },
      emerald: { border: "border-emerald-500/20", bg: "bg-emerald-500/5", text: "text-emerald-600 dark:text-emerald-400", iconBg: "bg-emerald-500/10" },
      violet: { border: "border-violet-500/20", bg: "bg-violet-500/5", text: "text-violet-600 dark:text-violet-400", iconBg: "bg-violet-500/10" },
      indigo: { border: "border-indigo-500/20", bg: "bg-indigo-500/5", text: "text-indigo-600 dark:text-indigo-400", iconBg: "bg-indigo-500/10" },
      orange: { border: "border-orange-500/20", bg: "bg-orange-500/5", text: "text-orange-600 dark:text-orange-400", iconBg: "bg-orange-500/10" },
      teal: { border: "border-teal-500/20", bg: "bg-teal-500/5", text: "text-teal-600 dark:text-teal-400", iconBg: "bg-teal-500/10" },
      fuchsia: { border: "border-fuchsia-500/20", bg: "bg-fuchsia-500/5", text: "text-fuchsia-600 dark:text-fuchsia-400", iconBg: "bg-fuchsia-500/10" },
      cyan: { border: "border-cyan-500/20", bg: "bg-cyan-500/5", text: "text-cyan-600 dark:text-cyan-400", iconBg: "bg-cyan-500/10" },
      red: { border: "border-red-500/20", bg: "bg-red-500/5", text: "text-red-600 dark:text-red-400", iconBg: "bg-red-500/10" },
      blue: { border: "border-blue-500/20", bg: "bg-blue-500/5", text: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-500/10" },
    };
    return colors[theme] || colors.blue;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-4 text-center">
        <p className="mb-4 text-gray-500">خطا در بارگذاری اطلاعات</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
          تلاش مجدد
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 transition-colors duration-300 selection:bg-cyan-500/30">
      {/* پس‌زمینه الگو - بسیار ریزتر و ملایم‌تر */}
      <div className="
  fixed inset-0 
  bg-[linear-gradient(to_right,#e5e5e5_0.5px,transparent_0.5px),linear-gradient(to_bottom,#e5e5e5_0.5px,transparent_0.5px)] 
  dark:bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]
  bg-[size:24px_24px] 
  pointer-events-none 
  opacity-20
  dark:opacity-100
" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-8">
        

        <main className="space-y-4">
          {/* بخش آمار */}
          <section>
            <SimpleQuickStats />
          </section>

          {/* گرید اکشن‌ها */}
          <section>
            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1 md:gap-4">
              {actions.map((action) => {
                const Icon = action.icon;
                const styles = getColorStyles(action.colorTheme);
                
                return (
                  <Link 
                    key={action.href} 
                    href={action.href} 
                    className="group block"
                  >
                    <div className={`
                      h-full min-h-[100px] md:min-h-[110px] rounded-2xl
                      p-1 flex flex-col items-center justify-center text-center
                      transition-all duration-300 ease-out
                      hover:scale-[1.03] hover:shadow-lg hover:shadow-cyan-500/10
                      dark:hover:shadow-cyan-500/5
                      cursor-pointer relative overflow-hidden
                    `}>
                      {/* افکت درخشش ملایم هنگام هاور */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none dark:from-white/5" />

                      {/* کادر آیکون */}
                      <div className={`
                        mb-3 p-2.5 rounded-xl border border-white/20 dark:border-white/5
                        ${styles.iconBg} shadow-sm
                        group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300
                      `}>
                        <Icon className={`w-6 h-6 ${styles.text}`} strokeWidth={2} />
                      </div>

                      {/* متن */}
                      <h3 className="text-[11px] md:text-sm  text-gray-800 dark:text-gray-200 mb-1 line-clamp-1 w-full">
                        {action.label}
                      </h3>
       
       
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}