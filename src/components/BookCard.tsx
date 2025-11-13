// components/BookCard.tsx
import Link from "next/link";
import { Book } from "@prisma/client";
import { Trash2, Eye } from "lucide-react";

interface BookCardProps {
  book: Book;
  onDelete: (id: string) => void;
}

export function BookCard({ book, onDelete }: BookCardProps) {
  return (
    // این div جایگزین کامپوننت Card می‌شود
    <div className="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm">
      {/* این div جایگزین CardHeader می‌شود */}
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight line-clamp-1">
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {book.description || "توضیحاتی وجود ندارد"}
        </p>
      </div>

      {/* این div جایگزین CardContent می‌شود */}
      <div className="flex-1 p-6 pt-0">
        <p className="text-sm text-muted-foreground">
          آخرین ویرایش: {new Date(book.updatedAt).toLocaleDateString("fa-IR")}
        </p>
      </div>

      {/* این div جایگزین CardFooter می‌شود */}
      <div className="flex justify-between gap-2 p-6 pt-0">
        <Link href={`/books/${book.id}`} className="flex-1">
          {/* این دکمه جایگزین Button variant="outline" می‌شود */}
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 w-full">
            <Eye className="ml-2 h-4 w-4" />
            مشاهده کارت‌ها
          </button>
        </Link>

        {/* این دکمه جایگزین Button variant="destructive" می‌شود */}
        <button
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 w-10 p-0"
          onClick={() => onDelete(book.id)}
          aria-label="حذف کتاب"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}