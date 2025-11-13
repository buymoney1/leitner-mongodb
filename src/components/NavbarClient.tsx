// components/NavbarClient.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react"; // useEffect را وارد کنید
import { SignOut } from "./sign-out";
import { Session } from "next-auth";

interface NavbarClientProps {
  session: Session | null;
}

export function NavbarClient({ session }: NavbarClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // --- این هوک جدید اضافه می‌شود ---
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        {/* لوگو که نام کاربر را نمایش می‌دهد */}
        <Link href="/" className="mr-4 flex items-center space-x-2 lg:mr-6">
          <span className="font-bold">
            {session?.user ? session.user.name : "پروژه شما"}
          </span>
        </Link>

        {/* منوی دسکتاپ */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            خانه
          </Link>
          {/* --- این شرط تغییر می‌کند --- */}
          {isMounted && session?.user && (
            <>
              <Link
                href="/books"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                کتاب‌ها
              </Link>
              <Link
                href="/dashboard/review"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
              >
                مرور
              </Link>
            </>
          )}
          <Link
            href="/about"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            درباره ما
          </Link>
        </nav>

        {/* دکمه منوی همبرگر و لینک ورود */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* --- این شرط تغییر می‌کند --- */}
          {!isMounted || !session?.user ? (
            <Link
              href="/login"
              className="text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60"
            >
              ورود
            </Link>
          ) : null}

          {/* دکمه منوی همبرگر */}
          <button
            className="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {/* ... آیکون همبرگر ... */}
            <svg
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
            <span className="sr-only">تغییر وضعیت منو</span>
          </button>
        </div>
      </div>

      {/* منوی موبایل */}
      <div
        className={`
          md:hidden overflow-hidden transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? "max-h-64" : "max-h-0"}
        `}
      >
        <div className="mx-4 flex flex-col gap-2 py-4">
          <Link
            href="/"
            className="flex items-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            خانه
          </Link>
          {/* --- این شرط تغییر می‌کند --- */}
          {isMounted && session?.user && (
            <>
              <Link
                href="/books"
                className="flex items-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                کتاب‌ها
              </Link>
              <Link
                href="/dashboard/review"
                className="flex items-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                مرور
              </Link>
            </>
          )}
          <Link
            href="/about"
            className="flex items-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            درباره ما
          </Link>

          {/* --- این شرط تغییر می‌کند --- */}
          {isMounted && session?.user && (
            <div className="flex items-center justify-between rounded-md p-2">
              <span className="text-sm font-medium">{session.user.name}</span>
              <SignOut />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}