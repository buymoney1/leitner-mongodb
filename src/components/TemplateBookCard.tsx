"use client";
import { useState } from "react";
import { Plus, BookOpen, Clock, Users, Sparkles } from "lucide-react";

interface TemplateBook {
  id: string;
  title: string;
  description: string;
  cards: { front: string; back: string; hint: string }[];
  level?: string;
  category?: string;
  estimatedTime?: string;
  popularity?: number;
}

interface TemplateBookCardProps {
  book: TemplateBook;
}

export function TemplateBookCard({ book }: TemplateBookCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleAdd = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/books/add-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateBookId: book.id }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("کتاب با موفقیت به مجموعه شما اضافه شد!");
      } else {
        console.error(data.error || "خطا در افزودن کتاب");
      }
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelColor = (level?: string) => {
    const colors = {
      'A1': 'from-green-500 to-emerald-600',
      'A2': 'from-blue-500 to-cyan-600',
      'B1': 'from-purple-500 to-violet-600',
      'B2': 'from-orange-500 to-amber-600',
      'C1': 'from-red-500 to-pink-600',
      'C2': 'from-gray-500 to-slate-600'
    };
    return colors[level as keyof typeof colors] || 'from-gray-500 to-slate-600';
  };

  const getCategoryIcon = (category?: string) => {
    const icons = {
      'مکالمه': '💬',
      'گرامر': '📖',
      'لغات': '📝',
      'تجاری': '💼',
      'آکادمیک': '🎓',
      'سفر': '✈️'
    };
    return icons[category as keyof typeof icons] || '📚';
  };

  return (
    <div 
      className="group relative flex flex-col rounded-2xl border border-gray-300 dark:border-gray-700/50 bg-white dark:bg-gray-800/50 bg-gradient-to-br from-white to-gray-50/80 dark:from-gray-800/50 dark:to-gray-900/30 backdrop-blur-xl shadow-lg dark:shadow-xl hover:shadow-xl dark:hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated Gradient Border */}
      <div className={`absolute inset-0 bg-gradient-to-r ${getLevelColor(book.level)} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`}></div>
      
      {/* Background Glow Effect */}
      <div className={`absolute -inset-10 bg-gradient-to-r ${getLevelColor(book.level)} rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

      <div className="relative z-10 p-6 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${getLevelColor(book.level)} shadow-lg`}>
              <span className="text-2xl">{getCategoryIcon(book.category)}</span>
            </div>
            <div>
              {book.level && (
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getLevelColor(book.level)} text-white shadow-lg`}>
                  {book.level}
                </span>
              )}
            </div>
          </div>
          
          {/* Popularity Badge */}
          {book.popularity && book.popularity > 100 && (
            <div className="flex items-center gap-1 bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-full text-xs border border-amber-500/30">
              <Sparkles className="h-3 w-3" />
              پرطرفدار
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="flex-1">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors duration-300 leading-tight">
            {book.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-xs mb-4 line-clamp-3 leading-relaxed">
            {book.description}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{book.cards.length} کارت</span>
            </div>
            {book.estimatedTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{book.estimatedTime}</span>
              </div>
            )}
            {book.popularity && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{book.popularity}+</span>
              </div>
            )}
          </div>
          
          {book.category && (
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600/50">
              {book.category}
            </span>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="relative z-10 p-6 pt-0">
        <button
          onClick={handleAdd}
          disabled={isLoading}
          className={`group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 px-6 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-cyan-600 hover:to-blue-700 hover:shadow-cyan-500/25 hover:scale-105 disabled:opacity-50 disabled:pointer-events-none`}
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Loading Animation */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-cyan-600 to-blue-700">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            </div>
          )}
          
          {/* Button Content */}
          <div className={`relative z-10 flex items-center justify-center gap-2 transition-all duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            <Plus className="h-4 w-4 transition-transform group-hover:rotate-90 duration-300" />
            <span>افزودن به مجموعه من</span>
          </div>

          {/* Ripple Effect */}
          <div className="absolute inset-0 overflow-hidden rounded-xl">
            <div className="absolute -inset-10 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:animate-pulse"></div>
          </div>
        </button>
      </div>

      {/* Hover Effects */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${getLevelColor(book.level)} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}>
        <div className="absolute inset-[1px] rounded-2xl bg-white dark:bg-gray-900"></div>
      </div>
    </div>
  );
}