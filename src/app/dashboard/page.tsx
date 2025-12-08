// app/dashboard/page.tsx

import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/DashboardClient";
import { PrismaClient } from "@prisma/client";
import { getAuthSession } from "../../../lib/server-auth";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const session = await getAuthSession();

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  // دریافت اطلاعات کامل کاربر (شامل نقش) از دیتابیس
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      role: true, // نقش کاربر را هم انتخاب می‌کنیم
    },
  });

  if (!user) {
    // اگر کاربری با این ایمیل در دیتابیس وجود نداشت (که نباید پیش بیاید)
    return <div>User not found in database.</div>;
  }

  // نام و نقش کاربر را به عنوان prop پاس می‌دهیم
  return (
    <DashboardClient
      userName={user.name || "کاربر"}
      userRole={user.role}
    />
  );
}