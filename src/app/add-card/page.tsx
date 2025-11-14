// app/add-card/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AddCardClient from "@/components/AddCardClient";

export default async function AddCardPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");

  return (
    <main className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-cyan-400">افزودن کارت جدید</h1>
        <p className="mb-8 text-gray-400">
          لغت جدیدی را که یاد می‌گیرید وارد کنید. اگر آن را بلد هستید، آن را به جعبه ۱ اضافه می‌کنیم تا فردا مرور شود.
        </p>
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <AddCardClient />
        </div>
      </div>
    </main>
  );
}
