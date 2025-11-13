// components/AddCardFab.tsx
"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export default function AddCardFab() {
  return (
    <Link
      href="/add-card"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-300 hover:scale-110"
      aria-label="افزودن کارت جدید"
    >
      <Plus className="h-6 w-6" />
    </Link>
  );
}