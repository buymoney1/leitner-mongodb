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

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      role: true, 
    },
  });

  if (!user) {
   return <div>User not found in database.</div>;
  }


  return (
    <DashboardClient
      userName={user.name || "کاربر"}
      userRole={user.role}
    />
  );
}