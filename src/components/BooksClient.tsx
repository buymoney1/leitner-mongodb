// components/BooksClient.tsx
"use client";

import { TemplateBookCard } from "./TemplateBookCard";

// --- تایپ مشخص برای داده‌های کتاب الگو ---
interface TemplateBook {
  id: string;
  title: string;
  description: string;
  cards: { front: string; back: string; hint: string }[];
}

// --- استفاده از تایپ جدید در اینترفیس ---
interface BooksClientProps {
  initialTemplateBooks: TemplateBook[];
}

export function BooksClient({ initialTemplateBooks }: BooksClientProps) {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="mb-4 text-2xl font-semibold">کتابخانه عمومی</h2>
        <p className="mb-6 text-muted-foreground">
          کتاب‌های زیر را به مجموعه خود اضافه کنید و شروع به یادگیری کنید.
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {initialTemplateBooks.map((book) => (
            <TemplateBookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </div>
  );
}