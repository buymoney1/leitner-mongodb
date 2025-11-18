// app/add-card/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AddCardClient from "@/components/AddCardClient";

export default async function AddCardPage() {
  const session = await auth();

  if (!session?.user) redirect("/login");

  return (
    <main >
  
      <AddCardClient />
    </main>
  );
}
