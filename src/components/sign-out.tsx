import { signOut } from "@/lib/auth";

export function SignOut() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <button
        type="submit"
        className="bg-red-500 text-white p-2 rounded cursor-pointer"
      >
        Sign Out
      </button>
    </form>
  );
}
