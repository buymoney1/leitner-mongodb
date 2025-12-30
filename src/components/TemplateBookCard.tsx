// components/TemplateBookCard.tsx
"use client";
import { useState } from "react";
import { Plus, BookOpen, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { toast } from "sonner";

interface TemplateBook {
  id: string;
  title: string;
  description: string;
  image?: string;
  cardsFile?: string; 
  level?: string;
  category?: string;
  estimatedTime?: string;
  popularity?: number;
  wordCount?: number; 
}

interface TemplateBookCardProps {
  book: TemplateBook;
}

export function TemplateBookCard({ book }: TemplateBookCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isAlreadyExists, setIsAlreadyExists] = useState(false);

  const handleAdd = async () => {
    setIsLoading(true);

    try {
      const res = await fetch("/api/books/add-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          templateBookId: book.id,
          cardsFile: book.cardsFile // ✅ ارسال نام فایل کارت‌ها
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        if (data.alreadyExists) {
          setIsAlreadyExists(true);
          setIsAdded(true);
          
          if (data.cardsAdded > 0) {
            toast.success(`لغات جدید اضافه شدند`, {
              description: `"${book.title}" قبلاً اضافه شده بود. ${data.cardsAdded} لغت جدید به آن اضافه شد.`,
              icon: <Info className="h-5 w-5 text-blue-500" />,
              action: {
                label: "مشاهده کارت‌ها",
                onClick: () => window.location.href = "/dashboard/review",
              },
            });
          } else {
            toast.info(`این کتاب قبلاً اضافه شده`, {
              description: `"${book.title}" قبلاً در مجموعه شما موجود است و تمام لغات آن قبلاً اضافه شده‌اند.`,
              icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
            });
          }
        } else {
          setIsAlreadyExists(false);
          setIsAdded(true);
          
          toast.success(`کتاب اضافه شد`, {
            description: `"${book.title}" با ${data.cardsAdded} لغت به مجموعه شما اضافه شد.`,
            icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
            action: {
              label: "مشاهده",
              onClick: () => window.location.href = "/books",
            },
          });
        }
      } else {
        toast.error("خطا در اضافه کردن کتاب", {
          description: data.error || "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.",
        });
      }
    } catch (error) {
      console.error("خطا در افزودن کتاب:", error);
      toast.error("خطا در ارتباط", {
        description: "خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // رنگ سطح
  const levelStyle: Record<string, string> = {
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

      {/* Ribbon تعداد لغات */}
      <div
        className={`
          absolute left-0 top-0
          px-2 py-1 text-[10px] font-semibold
          ${isAlreadyExists ? "bg-yellow-500" : "bg-gray-800 dark:bg-gray-700"}
          text-white
          rounded-br-lg
        `}
      >
        {book.wordCount || book.estimatedTime || "?"} {book.wordCount ? "لغت" : "دقیقه"}
        {isAlreadyExists && " (موجود)"}
      </div>

      {/* تصویر */}
      <div className="w-full flex justify-center mb-2 mt-3 relative">
        {isAlreadyExists && (
          <div className="absolute -top-1 -right-1 z-10">
            <div className="bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              موجود
            </div>
          </div>
        )}
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
              loading="lazy"
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


      {/* <p className="
        text-[11px] text-gray-600 dark:text-gray-400 
        text-center line-clamp-2
        mb-2 px-1
      ">
        {book.description}
      </p> */}


      {/* <div className="flex items-center justify-center gap-3 mb-3">
        {book.category && (
          <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
            {book.category}
          </span>
        )}
        {book.popularity && (
          <span className="text-[10px] flex items-center gap-1 text-gray-500">
            👥 {book.popularity}
          </span>
        )}
      </div> */}

      {/* دکمه */}
      <button
        onClick={handleAdd}
        disabled={isLoading}
        className={`
          mt-auto
          w-full py-2 rounded-lg font-medium text-sm
          flex items-center justify-center gap-2
          transition-all duration-200
          ${
            isAlreadyExists
              ? "bg-yellow-500 hover:bg-yellow-600 text-white"
              : isAdded
              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          active:scale-95
        `}
      >
        {isLoading ? (
          <>
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>در حال افزودن...</span>
          </>
        ) : isAlreadyExists ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>اضافه شد</span>
          </>
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