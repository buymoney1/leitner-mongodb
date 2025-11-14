// app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/DashboardClient";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // نام کاربر را به عنوان prop پاس می‌دهیم
  return <DashboardClient userName={session.user.name || "کاربر"} />;
}