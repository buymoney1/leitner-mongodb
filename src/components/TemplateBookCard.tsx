"use client";
import { useState } from "react";
import { Plus, BookOpen, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface TemplateBook {
  id: string;
  title: string;
  description: string;
  image?: string;
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
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = async () => {
    if (isAdded) return;
    setIsLoading(true);

    try {
      const res = await fetch("/api/books/add-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateBookId: book.id }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsAdded(true);
        toast.success(`"${book.title}" اضافه شد`, {
          description: `${book.cards.length} کارت اضافه شد`,
        });
      } else {
        toast.error(data.error || "مشکلی پیش آمد");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // رنگ سطح
  const levelStyle: any = {
    A1: "bg-emerald-500",
    A2: "bg-sky-500",
    B1: "bg-violet-500",
    B2: "bg-orange-500",
    C1: "bg-rose-500",
    C2: "bg-gray-500",
  };

  return (
    <div
      className="
        relative
        group flex flex-col
        bg-white dark:bg-gray-900 
        transition-all duration-300
        rounded-xl
        p-2
        shadow-sm hover:shadow-md
        min-h-[210px]
      "
    >
      {/* Ribbon سطح */}
      {book.level && (
        <div
          className={`
            absolute right-0 top-0
            px-2 py-1 text-[10px] font-semibold text-white
            rounded-bl-lg
            ${levelStyle[book.level] || "bg-gray-600"}
          `}
        >
           {book.level}
        </div>
      )}

      {/* Ribbon تعداد کارت */}
      <div
        className="
          absolute left-0 top-0
          px-2 py-1 text-[10px] font-semibold
          bg-gray-800 text-white
          dark:bg-gray-700
          rounded-br-lg
        "
      >
        {book.cards.length} لغت
      </div>

      {/* تصویر */}
      <div className="w-full flex justify-center mb-2 mt-3">
        <div className="
          w-16 h-22 rounded-lg overflow-hidden 
          bg-gray-100 dark:bg-gray-700
          shadow 
        ">
          {book.image ? (
            <img
              src={book.image}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* عنوان */}
      <h3 className="
        text-[13px] font-semibold text-center 
        text-gray-800 dark:text-white 
         line-clamp-2
      ">
        {book.title}
      </h3>

      {/* دکمه */}
      <button
        onClick={handleAdd}
        disabled={isLoading || isAdded}
        className={`
          mt-auto
          w-full py-2 rounded-lg font-medium text-sm
          flex items-center justify-center gap-2
          transition-all
          ${
            isAdded
              ? "bg-emerald-500 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }
          disabled:opacity-50
        `}
      >
        {isLoading ? (
          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : isAdded ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>اضافه شد</span>
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            <span>افزودن</span>
          </>
        )}
      </button>
    </div>
  );
}
