// app/add-card/page.tsx

import { redirect } from "next/navigation";
import AddCardClient from "@/components/AddCardClient";
import { getAuthSession } from "../../../lib/server-auth";

export default async function AddCardPage() {
  const session = await getAuthSession();

  if (!session?.user) redirect("/login");

  return (
    <main >
  
      <AddCardClient />
    </main>
  );
}
