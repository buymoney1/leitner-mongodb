"use client";

import { useState, useEffect } from "react";
import { Card } from "@prisma/client";
import { Search, Filter, RefreshCw, Box, Calendar, Edit3 } from "lucide-react";

export function ManageCardsClient() {
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [boxFilter, setBoxFilter] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<"box" | "time" | "word">("box");

  useEffect(() => {
    fetchCards();
  }, []);

  useEffect(() => {
    filterAndSortCards();
  }, [allCards, searchTerm, boxFilter, sortBy]);

  const fetchCards = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/cards");
      if (response.ok) {
        const data = await response.json();
        setAllCards(data);
      }
    } catch (error) {
      console.error("Failed to fetch cards:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortCards = () => {
    let filtered = allCards.filter(card => {
      const matchesSearch = card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           card.back?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBox = boxFilter === "all" || card.boxNumber === boxFilter;
      return matchesSearch && matchesBox;
    });

    // مرتب‌سازی
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "box":
          return a.boxNumber - b.boxNumber;
        case "time":
          return new Date(a.nextReviewAt || 0).getTime() - new Date(b.nextReviewAt || 0).getTime();
        case "word":
          return a.front.localeCompare(b.front);
        default:
          return 0;
      }
    });

    setFilteredCards(filtered);
  };

  const handleBoxChange = async (cardId: string, newBoxNumber: number) => {
    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newBoxNumber }),
      });

      if (response.ok) {
        setAllCards(allCards.map(card =>
          card.id === cardId ? { ...card, boxNumber: newBoxNumber } : card
        ));
      } else {
        alert("خطا در به‌روزرسانی جعبه.");
      }
    } catch (error) {
      alert("خطا در ارتباط با سرور.");
    }
  };

  const getTimeUntilReview = (nextReviewAt: string | Date | null | undefined) => {
    if (!nextReviewAt) {
      return "زمان مرور مشخص نیست";
    }

    const now = new Date();
    const reviewDate = new Date(nextReviewAt);

    if (isNaN(reviewDate.getTime())) {
      return "تاریخ نامعتبر";
    }

    const diffInMs = reviewDate.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays <= 0) {
      return <span className="text-red-500 dark:text-red-400 font-semibold">امروز</span>;
    } else if (diffInDays === 1) {
      return <span className="text-amber-500 dark:text-amber-400">فردا</span>;
    } else if (diffInDays <= 7) {
      return <span className="text-yellow-500 dark:text-yellow-400">{diffInDays} روز دیگر</span>;
    } else {
      const weeks = Math.floor(diffInDays / 7);
      const remainingDays = diffInDays % 7;
      if (remainingDays === 0) {
        return <span className="text-green-500 dark:text-green-400">{weeks} هفته دیگر</span>;
      } else {
        return <span className="text-green-500 dark:text-green-400">{weeks} هفته و {remainingDays} روز دیگر</span>;
      }
    }
  };

  const getBoxColor = (boxNumber: number) => {
    const colors = [
      "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30",
      "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30",
      "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
      "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
      "bg-lime-500/20 text-lime-600 dark:text-lime-400 border-lime-500/30",
      "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30",
      "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30"
    ];
    return colors[boxNumber - 1] || colors[0];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-cyan-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">در حال بارگذاری کارت‌ها...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-300 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-800/50 dark:to-gray-900/30 backdrop-blur-xl shadow-xl dark:shadow-2xl overflow-hidden transition-colors duration-300">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30 transition-colors duration-300">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
              مدیریت کارت‌ها
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">مدیریت و سازماندهی تمام کارت‌های یادگیری</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchCards}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600/50 transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4" />
              بروزرسانی
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="جستجو در کارت‌ها..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-3 rounded-xl bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
            />
          </div>

          {/* Box Filter */}
          <div className="relative">
            <Box className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <select
              value={boxFilter}
              onChange={(e) => setBoxFilter(e.target.value === "all" ? "all" : parseInt(e.target.value))}
              className="w-full pl-4 pr-10 py-3 rounded-xl bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 appearance-none"
            >
              <option value="all">همه جعبه‌ها</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>جعبه {num}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full pl-4 pr-10 py-3 rounded-xl bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 appearance-none"
            >
              <option value="box">مرتب‌سازی بر اساس جعبه</option>
              <option value="time">مرتب‌سازی بر اساس زمان مرور</option>
              <option value="word">مرتب‌سازی بر اساس کلمه</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100/50 dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-700/50 transition-colors duration-300">
            <tr className="text-right">
              <th className="p-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">کلمه / عبارت</th>
              <th className="p-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">جعبه</th>
              <th className="p-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">زمان مرور بعدی</th>
            </tr>
          </thead>
          <tbody>
            {filteredCards.map((card) => (
              <tr
                key={card.id}
                className="border-b border-gray-200 dark:border-gray-700/30 hover:bg-gray-100/50 dark:hover:bg-gray-700/20 transition-all duration-300 group"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-200 dark:bg-gray-700/50 rounded-lg group-hover:bg-gray-300 dark:group-hover:bg-gray-600/50 transition-colors">
                      <Edit3 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm">{card.front}</div>
                      {card.back && (
                        <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">{card.back}</div>
                      )}
                    </div>
                  </div>
                </td>
                
                <td className="p-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border ${getBoxColor(card.boxNumber)} text-xs font-medium`}>
                    <Box className="h-4 w-4" />
                    جعبه {card.boxNumber}
                  </div>
                </td>
                
                <td className="p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    {getTimeUntilReview(card.nextReviewAt)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCards.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📝</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">کارتی یافت نشد</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              {searchTerm || boxFilter !== "all" ? "سعی کنید فیلترهای جستجو را تغییر دهید" : "هنوز هیچ کارتی ایجاد نکرده‌اید"}
            </p>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {allCards.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/30 transition-colors duration-300">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>تعداد کل: {allCards.length} کارت</span>
              <span>نمایش: {filteredCards.length} کارت</span>
            </div>
            <div className="flex items-center gap-2">
              <span>جعبه فعال: </span>
              {boxFilter === "all" ? "همه" : boxFilter}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}