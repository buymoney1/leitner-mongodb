
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";
import { getAuthSession } from "../../../lib/server-auth";


export default async function ProfilePage() {
  const session = await getAuthSession();

  if (!session?.user) redirect("/login");

  return <ProfileClient />;
}