"use client";
import { useState } from "react";
import { Plus, BookOpen, Clock, Users, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

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
          description: `${book.cards.length} کارت به مجموعه شما افزوده شد`,
        });
      } else {
        toast.error(data.error || "خطایی رخ داد");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelColor = (level?: string) => {
    const colors = {
      A1: "bg-green-500",
      A2: "bg-blue-500",
      B1: "bg-purple-500",
      B2: "bg-orange-500",
      C1: "bg-red-500",
      C2: "bg-slate-500",
    };
    return colors[level as keyof typeof colors] || "bg-gray-500";
  };

  return (
    <div className="
      group relative flex flex-col rounded-3xl p-5
      bg-white dark:bg-neutral-900 
      border border-neutral-200 dark:border-neutral-700
      shadow-sm hover:shadow-xl
      transition-all duration-500 hover:-translate-y-2
    ">
      
      {/* Book Image */}
      {book.image && (
        <div className="w-full flex justify-center mt-2 mb-4">
          <div className="
            w-[80px] h-[110px] rounded-2xl overflow-hidden bg-neutral-200 dark:bg-neutral-700
            shadow-md group-hover:scale-105 transition-transform duration-500
          ">
            <img 
              src={book.image}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Level Badge */}
      {book.level && (
        <div className="absolute top-4 right-4">
          <span className={`
            ${getLevelColor(book.level)} text-white 
            text-xs font-semibold px-3 py-1 rounded-full shadow-md
          `}>
            {book.level}
          </span>
        </div>
      )}

      {/* Title */}
      <h3 className="
        text-lg font-bold text-neutral-800 dark:text-neutral-200 
        mb-2 text-center line-clamp-2
      ">
        {book.title}
      </h3>

      {/* Description */}
      <p className="
        text-neutral-600 dark:text-neutral-300 
        text-sm text-center mb-4 line-clamp-3
      ">
        {book.description}
      </p>

      {/* Stats */}
      <div className="
        flex items-center justify-center gap-6 mb-5 text-neutral-500 dark:text-neutral-300
      ">
        <div className="flex items-center gap-1 text-sm">
          <BookOpen className="w-4 h-4" />
          <span>{book.cards.length} کارت</span>
        </div>

        {book.estimatedTime && (
          <div className="flex items-center gap-1 text-sm">
            <Clock className="w-4 h-4" />
            <span>{book.estimatedTime}</span>
          </div>
        )}

        {book.popularity && (
          <div className="flex items-center gap-1 text-sm">
            <Users className="w-4 h-4" />
            <span>{book.popularity}+</span>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={handleAdd}
        disabled={isLoading || isAdded}
        className={`
          w-full py-3 rounded-xl font-semibold text-sm transition-all
          flex items-center justify-center gap-2
          ${
            isAdded
              ? "bg-green-500 text-white cursor-default"
              : "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-700 dark:hover:bg-neutral-600"
          }
        `}
      >
        {isLoading ? (
          <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : isAdded ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            <span>اضافه شد</span>
          </>
        ) : (
          <>
            <Plus className="w-5 h-5" />
            <span>افزودن به مجموعه</span>
          </>
        )}
      </button>
    </div>
  );
}
