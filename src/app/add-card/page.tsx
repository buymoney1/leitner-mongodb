// app/add-card/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AddCardClient from "@/components/AddCardClient";

export default async function AddCardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="container mx-auto p-6 md:p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold tracking-tight">افزودن کارت جدید</h1>
        <p className="mb-8 text-muted-foreground">
          لغت جدیدی را که یاد می‌گیرید وارد کنید. اگر آن را بلد هستید، آن را به جعبه ۱ اضافه می‌کنیم تا فردا مرور شود.
        </p>
        <AddCardClient />
      </div>
    </main>
  );
}