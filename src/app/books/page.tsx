// app/books/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BooksClient } from "@/components/BooksClient";
import { readFile } from "fs/promises";
import path from "path";

export default async function BooksPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // --- دریافت کتاب‌های الگو از فایل JSON ---
  // دیگر نیازی به گرفتن کتاب‌های شخصی از دیتابیس نیست
  const filePath = path.join(process.cwd(), 'data', 'template-books.json');
  const fileContent = await readFile(filePath, 'utf-8');
  const templateBooks = JSON.parse(fileContent);

  return (
    <main className="container mx-auto p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">کتاب‌های من</h1>
        <p className="text-muted-foreground">
          در اینجا می‌توانید لیست کتاب‌های فلش‌کارت خود را مشاهده و مدیریت کنید.
        </p>
      </div>

      {/* --- فقط initialTemplateBooks پاس داده می‌شود --- */}
      <BooksClient initialTemplateBooks={templateBooks} />
    </main>
  );
}