// components/BooksClient.tsx
"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus, Search, Filter, X, TrendingUp, BookOpen } from "lucide-react";
import { useState, useMemo } from "react";
import { TemplateBookCard } from "./TemplateBookCard";

interface TemplateBook {
  id: string;
  title: string;
  description: string;
  cardsFile?: string;
  level?: string;
  category?: string;
  estimatedTime?: string;
  popularity?: number;
  image?: string;
  wordCount?: number;
}

interface BooksClientProps {
  initialTemplateBooks: TemplateBook[];
}

export function BooksClient({ initialTemplateBooks }: BooksClientProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'admin';
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // استخراج سطوح و دسته‌بندی‌های موجود
  const levels = useMemo(() => 
    Array.from(new Set(initialTemplateBooks
      .map(book => book.level)
      .filter(Boolean) as string[])), 
    [initialTemplateBooks]
  );

  const categories = useMemo(() => 
    Array.from(new Set(initialTemplateBooks
      .map(book => book.category)
      .filter(Boolean) as string[])), 
    [initialTemplateBooks]
  );

  // فیلتر کتاب‌ها
  const filteredBooks = useMemo(() => 
    initialTemplateBooks.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           book.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = selectedLevel === "all" || book.level === selectedLevel;
      const matchesCategory = selectedCategory === "all" || book.category === selectedCategory;
      
      return matchesSearch && matchesLevel && matchesCategory;
    }), 
    [initialTemplateBooks, searchTerm, selectedLevel, selectedCategory]
  );

  // آمار کلی
  const stats = useMemo(() => ({
    totalBooks: initialTemplateBooks.length,
    totalWords: initialTemplateBooks.reduce((sum, book) => sum + (book.wordCount || 0), 0),
    totalTime: initialTemplateBooks.reduce((sum, book) => {
      const time = book.estimatedTime ? parseInt(book.estimatedTime) : 0;
      return sum + time;
    }, 0),
  }), [initialTemplateBooks]);

  // مرتب‌سازی بر اساس محبوبیت
  const sortedBooks = useMemo(() => 
    [...filteredBooks].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)),
    [filteredBooks]
  );

  // ریست فیلترها
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedLevel("all");
    setSelectedCategory("all");
    setShowFilters(false);
  };

  // آیا فیلتری فعال است؟
  const hasActiveFilters = searchTerm || selectedLevel !== "all" || selectedCategory !== "all";

  return (
    <div className="mb-10 transition-colors duration-300 pb-8 pt-3 px-4 sm:px-6 lg:px-8 min-h-screen">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                کتابخانه آموزشی
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                مجموعه‌ای از بهترین منابع برای یادگیری زبان انگلیسی
              </p>
            </div>
            

          </div>

        </div>

        {/* Search and Filters */}
        <div className="sticky top-4 z-20 mb-8">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700/50">
            <div className="flex flex-col md:flex-row gap-4">
              {/* جستجو */}
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="جستجوی کتاب یا موضوع..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              {/* دکمه فیلترها */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <Filter className="h-5 w-5" />
                فیلترها
                {hasActiveFilters && (
                  <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                    فعال
                  </span>
                )}
              </button>
            </div>

            {/* پنل فیلترها */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">فیلترهای پیشرفته</h3>
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                    پاک کردن همه
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* سطح */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      سطح
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedLevel("all")}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedLevel === "all"
                            ? "bg-purple-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        همه سطوح
                      </button>
                      {levels.map(level => (
                        <button
                          key={level}
                          onClick={() => setSelectedLevel(level)}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedLevel === level
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* دسته‌بندی */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      دسته‌بندی
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedCategory("all")}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === "all"
                            ? "bg-purple-500 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        همه دسته‌ها
                      </button>
                      {categories.map(category => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            selectedCategory === category
                              ? "bg-green-500 text-white"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* نتایج */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                کتاب‌های موجود
                <span className="text-gray-600 dark:text-gray-400 text-lg font-normal">
                  ({filteredBooks.length} کتاب)
                </span>
              </h2>
            </div>
            
            {/* فیلترهای فعال */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">فیلترهای فعال:</span>
                {searchTerm && (
                  <span className="bg-purple-500/20 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-lg border border-purple-500/30 text-sm">
                    "{searchTerm}"
                  </span>
                )}
                {selectedLevel !== "all" && (
                  <span className="bg-blue-500/20 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/30 text-sm">
                    سطح {selectedLevel}
                  </span>
                )}
                {selectedCategory !== "all" && (
                  <span className="bg-green-500/20 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-lg border border-green-500/30 text-sm">
                    {selectedCategory}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* لیست کتاب‌ها */}
          {sortedBooks.length > 0 ? (
            <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {sortedBooks.map((book) => (
                <TemplateBookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700/50 backdrop-blur-sm">
              <div className="text-gray-400 text-8xl mb-6">📚</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                کتابی یافت نشد
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-6 max-w-md mx-auto">
                با تغییر فیلترها یا عبارت جستجو، کتاب‌های بیشتری را کشف کنید
              </p>
              <button
                onClick={resetFilters}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25 font-semibold"
              >
                حذف همه فیلترها و نمایش همه کتاب‌ها
              </button>
            </div>
          )}

          {/* راهنمای سطوح */}
          <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700/50">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">راهنمای سطوح:</h4>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {[
                { level: "A1", label: "مبتدی", color: "bg-emerald-500" },
                { level: "A2", label: "مقدماتی", color: "bg-sky-500" },
                { level: "B1", label: "متوسط", color: "bg-violet-500" },
                { level: "B2", label: "متوسط رو به بالا", color: "bg-orange-500" },
                { level: "C1", label: "پیشرفته", color: "bg-rose-500" },
                { level: "C2", label: "حرفه‌ای", color: "bg-gray-500" },
              ].map(item => (
                <div key={item.level} className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white">{item.level}</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400 block">{item.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}