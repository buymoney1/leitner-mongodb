// components/DashboardClientDark.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Brain, Plus } from "lucide-react";
import { ManageCardsClient } from "./ManageCardsClient";
import FlashcardProgressChartDark from "./FlashcardProgressChart";
import { ReviewNotificationBanner } from "./ReviewNotificationBanner";

interface Stats {
  totalCards: number;
  dueCards: number;
  boxCounts: Record<number, number>;
  books: { id: string; title: string }[];
}

interface DashboardClientProps {
  userName: string;
}

export function DashboardClient({ userName }: DashboardClientProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'manage'>('overview');


  
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
            {/* نمودار پیشرفت */}
          

            {/* دسترسی سریع */}
            <section className="mb-5">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
              </div>
            </section>

            <section className="mb-12">
              <FlashcardProgressChartDark />
            </section>
            
          </>
        )}

        {activeTab === 'manage' && <ManageCardsClient />}
      </div>
    </div>
  );
}
