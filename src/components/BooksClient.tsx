"use client";

import { useSession } from "next-auth/react";
import { TemplateBookCard } from "./TemplateBookCard";
import Link from "next/link";
import { Plus, Search, } from "lucide-react";
import { useState } from "react";

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
  const isAdmin = session?.user?.role === "admin";
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto">


        {/* Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          {/* Search and Filters */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-2 w-2 text-gray-400" />
              <input
                type="text"
                placeholder="جستجو در کتاب‌ها..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-sm w-full pl-4 pr-10 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 backdrop-blur-sm"
              />
            </div>



          </div>

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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                کتاب‌های موجود
                <span className="text-gray-400 text-lg font-normal">
                  ({filteredBooks.length} کتاب)
                </span>
              </h2>
            </div>
            
            {/* Active Filters */}
            <div className="flex items-center gap-2 text-sm text-gray-400">
              {(searchTerm || selectedLevel !== "all" || selectedCategory !== "all") && (
                <>
                  <span>فیلترهای فعال:</span>
                  {searchTerm && (
                    <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-lg">
                      "{searchTerm}"
                    </span>
                  )}
                  {selectedLevel !== "all" && (
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-lg">
                      {selectedLevel}
                    </span>
                  )}
                  {selectedCategory !== "all" && (
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-lg">
                      {selectedCategory}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {filteredBooks.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredBooks.map((book) => (
                <TemplateBookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 text-8xl mb-6">📚</div>
              <h3 className="text-2xl font-bold text-white mb-3">کتابی یافت نشد</h3>
              <p className="text-gray-400 text-lg mb-6">
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