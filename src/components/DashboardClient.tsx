// components/DashboardClientDark.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Brain, Plus, Play, Home, Video, Settings, Mic, Music, User, Map, FileText, Trash2 } from "lucide-react";
import { SimpleNotificationPrompt } from "./SimpleNotificationPrompt";

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

export function DashboardClient({ userName, userRole }: DashboardClientProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [videos, setVideos] = useState<{ recentVideos: any[], a1Videos: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'manage'>('overview');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsResponse, videosResponse] = await Promise.all([
          fetch("/api/user/stats"),
          fetch("/api/user/videos")
        ]);

        if (statsResponse.ok) {
          const data = await statsResponse.json();
          setStats(data);
        }
        if (videosResponse.ok) {
          const data = await videosResponse.json();
          setVideos(data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-cyan-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">خطا در بارگذاری اطلاعات</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors text-white"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  const QuickActionButton = ({ href, icon: Icon, label, color, description }: any) => (
    <Link href={href} className="block group">
      <div className={`
        relative overflow-hidden 
        rounded-xl border 
        border-gray-300 dark:border-gray-800 
        bg-white dark:bg-gray-800/30 
        bg-gradient-to-br ${color.bg} 
        p-3 backdrop-blur-sm 
        transition-all duration-300 
        group-hover:scale-105 
        group-hover:shadow-lg dark:group-hover:shadow-xl
        h-full
        ${isMobile ? 'min-h-[100px]' : 'min-h-[120px]'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg ${color.iconBg} flex items-center justify-center`}>
              <Icon className={`h-5 w-5 ${color.icon}`} />
            </div>
            <div className={`w-1.5 h-1.5 rounded-full ${color.dot} mt-1`}></div>
          </div>
          
          <div className="flex-1">
            <h3 className="whitespace-nowrap font-semibold text-gray-900 dark:text-white mb-1 text-[13px] line-clamp-1">
              {label}
            </h3>

          </div>
        </div>
        
        <div className={`absolute -bottom-3 -right-3 w-12 h-12 ${color.glow} rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity`}></div>
      </div>
    </Link>
  );



 
  const quickActions = [
    {
      href: "/profile",
      icon: User,
      label: "پروفایل",
      description: "پروفایل کاربری",
      color: {
        border: "border-rose-500/20",
        bg: "from-rose-500/10 to-pink-600/5",
        iconBg: "bg-rose-500/20",
        icon: "text-rose-600 dark:text-rose-400",
        dot: "bg-rose-500",
        glow: "bg-rose-500"
      }
    },
    {
      href: "/planner",
      icon: Map,
      label: "نقشه راه",
      description: "من تو این راه دستیار شما هستم",
      color: {
        border: "border-amber-500/20",
        bg: "from-amber-500/10 to-yellow-600/5",
        iconBg: "bg-amber-500/20",
        icon: "text-amber-600 dark:text-amber-400",
        dot: "bg-amber-500",
        glow: "bg-amber-500"
      }
    },
    {
      href: "/video-levels",
      icon: Play,
      label: "فیلم و سریال",
      description: "یادگیری از طریق فیلم",
      color: {
        border: "border-sky-500/20",
        bg: "from-sky-500/10 to-cyan-600/5",
        iconBg: "bg-sky-500/20",
        icon: "text-sky-600 dark:text-sky-400",
        dot: "bg-sky-500",
        glow: "bg-sky-500"
      }
    },
    {
      href: "/songs",
      icon: Music,
      label: "آهنگ‌ها",
      description: "گوش کنید و یاد بگیرید",
      color: {
        border: "border-emerald-500/20",
        bg: "from-emerald-500/10 to-green-600/5",
        iconBg: "bg-emerald-500/20",
        icon: "text-emerald-600 dark:text-emerald-400",
        dot: "bg-emerald-500",
        glow: "bg-emerald-500"
      }
    },
    {
      href: "/podcasts",
      icon: Mic,
      label: "پادکست‌ها",
      description: "یادگیری در هر مکان",
      color: {
        border: "border-violet-500/20",
        bg: "from-violet-500/10 to-purple-600/5",
        iconBg: "bg-violet-500/20",
        icon: "text-violet-600 dark:text-violet-400",
        dot: "bg-violet-500",
        glow: "bg-violet-500"
      }
    },
    {
      href: "/articles",
      icon: FileText,
      label: "مقالات",
      description: "مطالعه عمیق و دقیق",
      color: {
        border: "border-indigo-500/20",
        bg: "from-indigo-500/10 to-blue-600/5",
        iconBg: "bg-indigo-500/20",
        icon: "text-indigo-600 dark:text-indigo-400",
        dot: "bg-indigo-500",
        glow: "bg-indigo-500"
      }
    },
    {
      href: "/dashboard/review",
      icon: Brain,
      label: "شروع مرور",
      description: `${stats.dueCards} کارت برای مرور`,
      color: {
        border: "border-orange-500/20",
        bg: "from-orange-500/10 to-amber-600/5",
        iconBg: "bg-orange-500/20",
        icon: "text-orange-600 dark:text-orange-400",
        dot: "bg-orange-500",
        glow: "bg-orange-500"
      }
    },
    {
      href: "/books",
      icon: BookOpen,
      label: "کتابخانه",
      description: "ادامه یادگیری از کتاب‌ها",
      color: {
        border: "border-fuchsia-500/20",
        bg: "from-fuchsia-500/10 to-pink-600/5",
        iconBg: "bg-fuchsia-500/20",
        icon: "text-fuchsia-600 dark:text-fuchsia-400",
        dot: "bg-fuchsia-500",
        glow: "bg-fuchsia-500"
      }
    },
    {
      href: "/add-card",
      icon: Plus,
      label: "افزودن کارت",
      description: "ایجاد کارت جدید",
      color: {
        border: "border-lime-500/20",
        bg: "from-lime-500/10 to-green-600/5",
        iconBg: "bg-lime-500/20",
        icon: "text-lime-600 dark:text-lime-400",
        dot: "bg-lime-500",
        glow: "bg-lime-500"
      }
    },
    {
      href: "/dashboard/cards",
      icon: Trash2,
      label: "مدیریت کارت‌ها",
      description: "حذف و مدیریت لغات",
      color: {
        border: "border-red-500/20",
        bg: "from-red-500/10 to-rose-600/5",
        iconBg: "bg-red-500/20",
        icon: "text-red-600 dark:text-red-400",
        dot: "bg-red-500",
        glow: "bg-red-500"
      }
    }
  ];

  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white pb-20 md:pb-0 transition-colors duration-300">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
      
      <div className="relative z-10">

        {/* Header */}
        <div className="p-4 pb-1">
          <div className="flex items-center justify-between">
            {/* <div>
              <h1 className="text-sm md:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                خوش آمدید، {userName}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">امروز چه برنامه‌ای دارید؟</p>
            </div> */}
          </div>
        </div>

        {/* Desktop Tabs */}
        {/* ... existing desktop tabs code ... */}

        {/* Tab Content */}
        <div className="px-3 md:px-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Actions Grid */}
              <section>
                <div className=" grid grid-cols-3 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {quickActions.map((action, index) => (
                    <QuickActionButton
                      key={index}
                      href={action.href}
                      icon={action.icon}
                      label={action.label}
                      description={action.description}
                      color={action.color}
                    />
                  ))}
                </div>
              </section>
            </div>
          )}

        </div>

      </div>
     
      <SimpleNotificationPrompt />
    </div>
  );
}