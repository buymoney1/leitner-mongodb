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


  const filePath = path.join(process.cwd(), 'data', 'template-books.json');
  const fileContent = await readFile(filePath, 'utf-8');
  const templateBooks = JSON.parse(fileContent);

  return (
    <main className="container mx-auto p-6 md:p-8">

      <BooksClient initialTemplateBooks={templateBooks} />
    </main>
  );
}