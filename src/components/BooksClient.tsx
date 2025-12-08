"use client";

import { useSession } from "next-auth/react";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { TemplateBookCard } from "./TemplateBookCard";

interface TemplateBook {
  id: string;
  title: string;
  description: string;
  cards: { front: string; back: string; hint: string }[];
  level?: string;
  category?: string;
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

  // فیلتر کتاب‌ها
  const filteredBooks = initialTemplateBooks.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === "all" || book.level === selectedLevel;
    const matchesCategory = selectedCategory === "all" || book.category === selectedCategory;
    
    return matchesSearch && matchesLevel && matchesCategory;
  });

  // سطوح و دسته‌بندی‌های موجود
  const levels = [...new Set(initialTemplateBooks.map(book => book.level).filter(Boolean))];
  const categories = [...new Set(initialTemplateBooks.map(book => book.category).filter(Boolean))];

  return (
    <div className="mb-10 transition-colors duration-300 pb-8 pt-3 px-4 sm:px-6 lg:px-8">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto">


        {/* Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">


          {/* Admin Action */}
          {isAdmin && (
            <Link
              href="/dashboard/books/new"
              className="group flex items-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:scale-105 backdrop-blur-sm font-semibold"
            >
              <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
              افزودن کتاب جدید
            </Link>
          )}
        </div>

        {/* Books Grid */}
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
            
            {/* Active Filters */}
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              {(searchTerm || selectedLevel !== "all" || selectedCategory !== "all") && (
                <>
                  <span>فیلترهای فعال:</span>
                  {searchTerm && (
                    <span className="bg-purple-500/20 text-purple-600 dark:text-purple-400 px-2 py-1 rounded-lg border border-purple-500/30">
                      "{searchTerm}"
                    </span>
                  )}
                  {selectedLevel !== "all" && (
                    <span className="bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg border border-blue-500/30">
                      {selectedLevel}
                    </span>
                  )}
                  {selectedCategory !== "all" && (
                    <span className="bg-green-500/20 text-green-600 dark:text-green-400 px-2 py-1 rounded-lg border border-green-500/30">
                      {selectedCategory}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {filteredBooks.length > 0 ? (
  <div
    className="
      grid 
      gap-5
      grid-cols-2
      sm:grid-cols-3
      md:grid-cols-4
      lg:grid-cols-5
      xl:grid-cols-6
    "
  >
    {filteredBooks.map((book) => (
      <TemplateBookCard key={book.id} book={book} />
    ))}
  </div>
) : (
  <div className="text-center py-16 bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700/50 backdrop-blur-sm">
    <div className="text-gray-400 text-8xl mb-6">📚</div>
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">کتابی یافت نشد</h3>
    <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
      با تغییر فیلترها یا عبارت جستجو، کتاب‌های بیشتری را کشف کنید
    </p>
    <button
      onClick={() => {
        setSearchTerm("");
        setSelectedLevel("all");
        setSelectedCategory("all");
      }}
      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/25 font-semibold"
    >
      حذف همه فیلترها
    </button>
  </div>
)}

        </section>


      </div>
    </div>
  );
}