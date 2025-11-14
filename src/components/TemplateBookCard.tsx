"use client";
import { useState } from "react";
import { Plus } from "lucide-react";

interface TemplateBook {
  id: string;
  title: string;
  description: string;
  cards: { front: string; back: string; hint: string }[];
}

interface TemplateBookCardProps {
  book: TemplateBook;
}

export function TemplateBookCard({ book }: TemplateBookCardProps) {
  const [isLoading, setIsLoading] = useState(false);

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
        alert("کتاب با موفقیت به مجموعه شما اضافه شد!");
        window.location.reload();
      } else {
        alert(data.error || "خطا در افزودن کتاب");
      }
    } catch (error) {
      console.error("Add failed:", error);
      alert("خطا در افزودن کتاب");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="group flex flex-col rounded-xl border border-gray-700 bg-gray-800 shadow-lg hover:shadow-cyan-500/50 transition-transform hover:-translate-y-1 duration-300">
      <div className="p-6 flex-1 flex flex-col">
        {/* Placeholder تصویر کتاب */}
        <div className="flex items-center justify-center h-32 w-full mb-4 rounded-lg bg-gray-700 text-gray-500 text-4xl">
          📚
        </div>

        <h3 className="text-xl font-semibold text-white mb-2 line-clamp-1 group-hover:text-cyan-400">
          {book.title}
        </h3>
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">{book.description}</p>

        <span className="inline-block text-sm font-medium bg-cyan-900/30 text-cyan-400 px-3 py-1 rounded-full w-max">
          شامل {book.cards.length} کارت فلش
        </span>
      </div>

      <div className="p-6 pt-0">
        <button
          onClick={handleAdd}
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-500 py-2 text-sm font-medium text-white shadow hover:bg-cyan-600 transition-colors disabled:pointer-events-none disabled:opacity-50"
        >
          {isLoading ? "در حال افزودن..." : <>
            <Plus className="h-4 w-4" />
            افزودن به مجموعه من
          </>}
        </button>
      </div>
    </div>
  );
}
