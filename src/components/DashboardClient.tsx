// components/DashboardClientDark.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Brain, Plus, Play, Home, Video, Settings, Mic, Music } from "lucide-react";
import { ManageCardsClient } from "./ManageCardsClient";

import { VideoList } from "./video/VideoList";
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
      <div className={`relative overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-800/30 bg-gradient-to-br ${color.bg} p-6 backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg dark:group-hover:shadow-2xl h-full`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className={`p-3 rounded-xl ${color.iconBg} w-12 h-12 flex items-center justify-center mb-3`}>
              <Icon className={`h-6 w-6 ${color.icon}`} />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">{label}</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{description}</p>
          </div>
          <div className={`w-2 h-2 rounded-full ${color.dot} mt-2`}></div>
        </div>
        <div className={`absolute -bottom-4 -right-4 w-16 h-16 ${color.glow} rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity`}></div>
      </div>
    </Link>
  );

  const MobileNavBar = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-300 dark:border-gray-800 z-50 md:hidden">
      <div className="flex justify-around items-center p-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
            activeTab === 'overview' 
              ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Home className="h-5 w-5 mb-1" />
          <span className="text-xs">نمای کلی</span>
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
            activeTab === 'videos' 
              ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Video className="h-5 w-5 mb-1" />
          <span className="text-xs">ویدیوها</span>
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ${
            activeTab === 'manage' 
              ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Settings className="h-5 w-5 mb-1" />
          <span className="text-xs">مدیریت</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white pb-20 md:pb-0 transition-colors duration-300">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
      
      <div className="relative z-10">

        {/* Header */}
        <div className="p-5 pb-1">
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
        <div className="hidden md:flex space-x-1 border-b border-gray-300 dark:border-gray-800 mx-6 mb-6">
          {[
            { id: 'overview', label: 'نمای کلی', icon: Home },
            { id: 'videos', label: 'ویدیوها', icon: Video },
            { id: 'manage', label: 'مدیریت کارت‌ها', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-4 px-4 text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-600 dark:border-cyan-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-t-lg'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="px-4 md:px-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Actions Grid */}
              <section>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <QuickActionButton
                    href="/planner"
                    icon={Plus}
                    label="نقشه راه"
                    description="من تو این راه دستیار شما هستم"
                    color={{
                      border: "border-orange-500/20",
                      bg: "from-orange-500/10 to-orange-600/5",
                      iconBg: "bg-orange-500/20",
                      icon: "text-orange-600 dark:text-orange-400",
                      dot: "bg-orange-500",
                      glow: "bg-orange-500"
                    }}
                  />
                                  <QuickActionButton
                    href="/profile"
                    icon={Plus}
                    label="پروفایل"
                    description="پروفایل کاربری"
                    color={{
                      border: "border-purple-500/20",
                      bg: "from-purple-500/10 to-purple-600/5",
                      iconBg: "bg-purple-500/20",
                      icon: "text-purple-600 dark:text-purple-400",
                      dot: "bg-purple-500",
                      glow: "bg-purple-500"
                    }}
                  />
                  <QuickActionButton
                    href="/dashboard/review"
                    icon={Brain}
                    label="شروع مرور"
                    description={`${stats.dueCards} کارت برای مرور`}
                    color={{
                      border: "border-cyan-500/20",
                      bg: "from-cyan-500/10 to-cyan-600/5",
                      iconBg: "bg-cyan-500/20",
                      icon: "text-cyan-600 dark:text-cyan-400",
                      dot: "bg-cyan-500",
                      glow: "bg-cyan-500"
                    }}
                  />
                  <QuickActionButton
                    href="/books"
                    icon={BookOpen}
                    label="کتاب‌های من"
                    description="ادامه یادگیری از کتاب‌ها"
                    color={{
                      border: "border-purple-500/20",
                      bg: "from-purple-500/10 to-purple-600/5",
                      iconBg: "bg-purple-500/20",
                      icon: "text-purple-600 dark:text-purple-400",
                      dot: "bg-purple-500",
                      glow: "bg-purple-500"
                    }}
                  />
                  <QuickActionButton
                    href="/video-levels"
                    icon={Play}
                    label="فیلم و سریال"
                    description="یادگیری از طریق فیلم"
                    color={{
                      border: "border-orange-500/20",
                      bg: "from-orange-500/10 to-orange-600/5",
                      iconBg: "bg-orange-500/20",
                      icon: "text-orange-600 dark:text-orange-400",
                      dot: "bg-orange-500",
                      glow: "bg-orange-500"
                    }}
                  />
                    <QuickActionButton
                      href="/songs"
                      icon={Music}
                      label="آهنگ‌های انگلیسی"
                      description="گوش کنید و یاد بگیرید"
                      color={{
                        border: "border-green-500/20",
                        bg: "from-green-500/10 to-green-600/5",
                        iconBg: "bg-green-500/20",
                        icon: "text-green-600 dark:text-green-400",
                        dot: "bg-green-500",
                        glow: "bg-green-500"
                      }}
                    />
                  <QuickActionButton
                    href="/podcasts"
                    icon={Mic}
                    label="پادکست‌های آموزشی"
                    description="یادگیری در هر مکان"
                    color={{
                      border: "border-purple-500/20",
                      bg: "from-purple-500/10 to-purple-600/5",
                      iconBg: "bg-purple-500/20",
                      icon: "text-purple-600 dark:text-purple-400",
                      dot: "bg-purple-500",
                      glow: "bg-purple-500"
                    }}
                  />
                  <QuickActionButton
                    href="/articles"
                    icon={BookOpen}
                    label="مقاله‌های آموزشی"
                    description="مطالعه عمیق و دقیق"
                    color={{
                      border: "border-cyan-500/20",
                      bg: "from-cyan-500/10 to-cyan-600/5",
                      iconBg: "bg-cyan-500/20",
                      icon: "text-cyan-600 dark:text-cyan-400",
                      dot: "bg-cyan-500",
                      glow: "bg-cyan-500"
                    }}
                  />
                  <QuickActionButton
                    href="/add-card"
                    icon={Plus}
                    label="افزودن کارت"
                    description="ایجاد کارت جدید"
                    color={{
                      border: "border-green-500/20",
                      bg: "from-green-500/10 to-green-600/5",
                      iconBg: "bg-green-500/20",
                      icon: "text-green-600 dark:text-green-400",
                      dot: "bg-green-500",
                      glow: "bg-green-500"
                    }}
                  />

                </div>
              </section>

              {/* Stats Overview */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                  آمار یادگیری
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "کل کارت‌ها", value: stats.totalCards, color: "bg-blue-500" },
                    { label: "کارت‌های برای مرور", value: stats.dueCards, color: "bg-amber-500" },
                  ].map((stat, index) => (
                    <div key={index} className="bg-gray-50/80 dark:bg-gray-800/30 rounded-2xl p-4 border border-gray-300 dark:border-gray-700/50 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">{stat.label}</span>
                        <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="space-y-6">
              {videos && (
                <>
                  <VideoList
                    title="ویدیوهای اخیر"
                    videos={videos.recentVideos}
                    seeAllHref="/videos/recent"
                  />
                  <VideoList
                    title="ویدیوهای سطح A1"
                    videos={videos.a1Videos}
                    seeAllHref="/videos-by-level/A1"
                  />
                </>
              )}
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="bg-gray-50/80 dark:bg-gray-800/20 rounded-2xl border border-gray-300 dark:border-gray-700/50 backdrop-blur-sm">
              <ManageCardsClient />
            </div>
          )}
        </div>

        {/* Admin Panel */}
        {/* {userRole === 'admin' && (
          <div className="mt-8 px-4 md:px-6">
            <AdminPanel />
          </div>
        )} */}
      </div>
      <SimpleNotificationPrompt />
    </div>
  );
}