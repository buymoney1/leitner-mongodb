"use client";

import { useSession } from "next-auth/react";
import { TemplateBookCard } from "./TemplateBookCard";
import Link from "next/link";

interface TemplateBook {
  id: string;
  title: string;
  description: string;
  cards: { front: string; back: string; hint: string }[];
}

interface BooksClientProps {
  initialTemplateBooks: TemplateBook[];
}

export function BooksClient({ initialTemplateBooks }: BooksClientProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  return (
    <div className="space-y-12 px-4 sm:px-6 lg:px-8">
      <section>

        <div className="flex items-center justify-between">
          <h2 className="mb-2 text-3xl font-bold text-white">📚 کتابخانه عمومی</h2>

          {isAdmin && (
            <Link
              href="/dashboard/books/new"
              className="rounded-lg bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 text-sm"
            >
              ➕ افزودن کتاب
            </Link>
          )}
        </div>

        <p className="mb-8 text-gray-400">
          کتاب‌های زیر را به مجموعه خود اضافه کنید و شروع به یادگیری کنید.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {initialTemplateBooks.map((book) => (
            <TemplateBookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </div>
  );
}
