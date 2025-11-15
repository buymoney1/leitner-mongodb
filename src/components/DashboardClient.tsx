// components/DashboardClientDark.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Brain, Plus, Play } from "lucide-react"; // آیکون Play را اضافه کنید
import { ManageCardsClient } from "./ManageCardsClient";
import FlashcardProgressChartDark from "./FlashcardProgressChart";
import { ReviewNotificationBanner } from "./ReviewNotificationBanner";
import { Stats } from "fs";
import { AdminPanel } from "./video/AdminPanel";
import { VideoList } from "./video/VideoList";

// ... (اینترفیس Stats بدون تغییر)

interface DashboardClientProps {
  userName: string;
  userRole: string; // نقش کاربر را به عنوان پراپس دریافت می‌کنیم
}

export function DashboardClient({ userName, userRole }: DashboardClientProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [videos, setVideos] = useState<{ recentVideos: any[], a1Videos: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'manage' | 'videos'>('overview'); // تب ویدیوها را اضافه کنید

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
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-cyan-500 border-t-transparent mx-auto"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>خطا در بارگذاری اطلاعات.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <ReviewNotificationBanner />
      {/* تب‌ها */}
      <div className="flex space-x-1 border-b border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-4 px-3 text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          نمای کلی
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`pb-4 px-3 text-sm font-medium transition-colors ${
            activeTab === 'videos'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          ویدیوها
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`pb-4 px-3 text-sm font-medium transition-colors ${
            activeTab === 'manage'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          مدیریت کارت‌ها
        </button>
      </div>

      {/* محتوای تب‌ها */}
      <div>
        {activeTab === 'overview' && (
          <>
            <section className="mb-5">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* ... دکمه‌های دسترسی سریع ... */}
                <Link href="/dashboard/review" aria-label="شروع مرور">
                  <div className="flex items-center justify-center gap-3 rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-lg hover:shadow-cyan-500/50 transition-transform hover:scale-105">
                    <Brain className="h-6 w-6 text-gray-300" />
                    شروع مرور
                  </div>
                </Link>
                <Link href="/books" aria-label="کتاب‌های من">
                  <div className="flex items-center justify-center gap-3 rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-lg hover:shadow-purple-500/50 transition-transform hover:scale-105">
                    <BookOpen className="h-6 w-6 text-purple-400" />
                    کتاب‌های من
                  </div>
                </Link>
                <Link href="/add-card" aria-label="افزودن کارت جدید">
                  <div className="flex items-center justify-center gap-3 rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-lg hover:shadow-green-500/50 transition-transform hover:scale-105">
                    <Plus className="h-6 w-6 text-green-400" />
                    افزودن کارت جدید
                  </div>
                </Link>
                <Link href="/video-levels" aria-label="سطوح ویدیو">
                  <div className="flex items-center justify-center gap-3 rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-lg hover:shadow-orange-500/50 transition-transform hover:scale-105">
                    <Play className="h-6 w-6 text-orange-400" />
                    ویدیوهای آموزشی
                  </div>
                </Link>
              </div>
            </section>

            <section className="mb-12">
              <FlashcardProgressChartDark />
            </section>
          </>
        )}

        {activeTab === 'videos' && (
          <>
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
          </>
        )}

        {activeTab === 'manage' && <ManageCardsClient />}
      </div>

      {/* نمایش پنل ادمین فقط در صورت نقش ادمین */}
      {userRole === 'admin' && <AdminPanel />}
    </div>
  );
}