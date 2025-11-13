// components/TemplateBookCard.tsx
"use client";
import { useState } from "react";
import { Plus } from "lucide-react";

// یک اینترفیس برای تایپ داده‌های کتاب الگو از فایل JSON
interface TemplateBook {
  id: string;
  title: string;
  description: string;
  cards: { front: string; back: string; hint: string }[];
}

interface TemplateBookCardProps {
  book: TemplateBook; // از تایپ TemplateBook استفاده می‌کنیم
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
        window.location.reload(); // ساده‌ترین راه برای به‌روزرسانی لیست
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
    <div className="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight line-clamp-1">
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {book.description}
        </p>
      </div>
      <div className="flex-1 p-6 pt-0">
        <p className="text-sm text-muted-foreground">
          شامل {book.cards.length} کارت فلش
        </p>
      </div>
      <div className="p-6 pt-0">
        <button
          onClick={handleAdd}
          disabled={isLoading}
          className="inline-flex w-full cursor-pointer items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          {isLoading ? (
            "در حال افزودن..."
          ) : (
            <>
              <Plus className="ml-2 h-4 w-4" />
              افزودن به مجموعه من
            </>
          )}
        </button>
      </div>
    </div>
  );
}