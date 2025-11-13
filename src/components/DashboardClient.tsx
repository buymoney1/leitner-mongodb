// components/DashboardClient.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Brain, TrendingUp, Clock, Settings, List } from "lucide-react";

interface Stats {
  totalCards: number;
  dueCards: number;
  boxCounts: Record<number, number>;
  books: { id: string; title: string }[];
}

interface Card {
  id: string;
  front: string;
  back: string;
  boxNumber: number;
  book: { title: string };
}

export function DashboardClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [allCards, setAllCards] = useState<Card[]>([]); // این state باید وجود داشته باشد
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [view, setView] = useState<'stats' | 'manage'>('stats');

  useEffect(() => {
    fetchStats();
    fetchCards();
  }, []);

  const fetchStats = async () => {
    setIsLoadingStats(true);
    try {
      const response = await fetch("/api/user/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const fetchCards = async () => {
    setIsLoadingCards(true);
    try {
      const response = await fetch("/api/cards");
      if (response.ok) {
        const data = await response.json();
        setAllCards(data);
      }
    } catch (error) {
      console.error("Failed to fetch cards:", error);
    } finally {
      setIsLoadingCards(false);
    }
  };

  const handleBoxChange = async (cardId: string, newBoxNumber: number) => {
    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newBoxNumber }),
      });

      if (response.ok) {
        // --- اینجا باید از state allCards استفاده شود ---
        setAllCards(allCards.map(card =>
          card.id === cardId ? { ...card, boxNumber: newBoxNumber } : card
        ));
      } else {
        alert("خطا در به‌روزرسانی جعبه.");
      }
    } catch (error) {
        console.error("Failed to fetch stats:", error);
    }
  };

  if (isLoadingStats || isLoadingCards) {
    return <p>در حال بارگذاری اطلاعات...</p>;
  }

  if (!stats) {
    return <p>خطا در بارگذاری اطلاعات.</p>;
  }

  return (
    <div className="space-y-6">
      {/* دکمه‌های تغییر حالت نمایش */}
      <div className="flex gap-2">
        <button
          onClick={() => setView('stats')}
          className={`px-4 py-2 rounded-md flex items-center gap-2 ${
            view === 'stats' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          آمار
        </button>
        <button
          onClick={() => setView('manage')}
          className={`px-4 py-2 rounded-md flex items-center gap-2 ${
            view === 'manage' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
          }`}
        >
          <Settings className="h-4 w-4" />
          مدیریت کارت‌ها
        </button>
      </div>

      {/* نمایش آمار */}
      {view === 'stats' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* کارت: تعداد کل کارت‌ها */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
              <div className="ml-4">
                <h2 className="text-2xl font-bold">{stats.totalCards}</h2>
                <p className="text-sm text-muted-foreground">کل کارت‌ها</p>
              </div>
            </div>
          </div>

          {/* کارت: کارت‌های برای مرور امروز */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-muted-foreground" />
              <div className="ml-4">
                <h2 className="text-2xl font-bold">{stats.dueCards}</h2>
                <p className="text-sm text-muted-foreground">مرور امروز</p>
              </div>
            </div>
          </div>
          
          {/* کارت: لیست کتاب‌ها */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 md:col-span-2">
            <div className="flex items-center mb-4">
              <Brain className="h-8 w-8 text-muted-foreground" />
              <h2 className="ml-4 text-xl font-bold">کتاب‌های شما</h2>
            </div>
            <div className="space-y-2">
              {stats.books.length > 0 ? (
                stats.books.map((book) => (
                  <Link
                    key={book.id}
                    href={`/books/${book.id}`}
                    className="block p-2 rounded-md hover:bg-accent transition-colors"
                  >
                    {book.title}
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">شما هنوز کتابی ندارید.</p>
              )}
            </div>
          </div>

          {/* کارت: آمار جعبه‌ها */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 md:col-span-2 lg:col-span-4">
            <div className="flex items-center mb-4">
              <List className="h-8 w-8 text-muted-foreground" />
              <h2 className="ml-4 text-xl font-bold">توزیع جعبه‌ها (Leitner)</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(stats.boxCounts)
                .sort(([a], [b]) => Number(a) - Number(b)) // مرتب‌سازی بر اساس شماره جعبه
                .map(([boxNumber, count]) => (
                  <div key={boxNumber} className="text-center p-3 bg-secondary rounded-md">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-xs text-muted-foreground">جعبه {boxNumber}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* نمایش مدیریت کارت‌ها */}
      {view === 'manage' && (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">مدیریت تمام کارت‌ها</h2>
            <p className="text-sm text-muted-foreground">جعبه هر کلمه را به صورت دستی تغییر دهید.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-4 font-medium">کلمه (روی کارت)</th>
                  <th className="text-right p-4 font-medium">تغییر جعبه</th>
                </tr>
              </thead>
              <tbody>
                {allCards.map((card) => (
                  <tr key={card.id} className="border-b">
                    <td className="p-4">{card.front}</td>
                    <td className="p-4">
                      <select
                        value={card.boxNumber}
                        onChange={(e) => handleBoxChange(card.id, Number(e.target.value))}
                        className="rounded-md border border-input bg-background px-3 py-1 text-sm"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                          <option key={num} value={num}>جعبه {num}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {allCards.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                شما هنوز هیچ کارتی نساخته‌اید.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}