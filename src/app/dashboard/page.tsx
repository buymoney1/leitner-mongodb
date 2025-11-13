// app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/DashboardClient";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="container mx-auto p-6 md:p-8">
      <div>
        <h1 className="text-3xl mb-2 font-bold tracking-tight">داشبورد</h1>
        <p className="text-muted-foreground">
          خوش آمدی، {session.user.name}! این یک نمای کلی از پیشرفت توئه.
        </p>
      </div>

      <DashboardClient />
    </main>
  );
}