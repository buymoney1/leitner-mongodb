
//src/app/books/page.tsx
import { redirect } from "next/navigation";
import { BooksClient } from "@/components/BooksClient";
import { readFile } from "fs/promises";
import path from "path";
import { getAuthSession } from "../../../lib/server-auth";

export const revalidate = 0; // force revalidation

export default async function BooksPage() {
  const session = await getAuthSession();
  if (!session?.user) redirect("/login");

  // خواندن فایل مستقیم
  const filePath = path.join(process.cwd(), "data", "template-books.json");
  const fileContent = await readFile(filePath, "utf-8");
  const templateBooks = JSON.parse(fileContent);

  return (
    <main className="container mx-auto p-6 md:p-8">
      <BooksClient initialTemplateBooks={templateBooks} />
    </main>
  );
}
