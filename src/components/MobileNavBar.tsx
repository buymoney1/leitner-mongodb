// components/MobileNavBar.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Video, BookOpen, User, Brain } from "lucide-react";

export function MobileNavBar() {
  const pathname = usePathname();
  
  const hiddenPaths = [
    "/", 
    "/login", 
    "/onboarding",
    "/auth",
    "/api"
  ];
  
  if (hiddenPaths.some(path => pathname === path)) {
    return null;
  }

  const navItems = [
    {
      href: "/dashboard",
      icon: Home,
      label: "خانه",
      active: pathname === "/dashboard",
    },
    {
      href: "/video-levels",
      icon: Video,
      label: "ویدیو",
      active: pathname.startsWith("/video"),
    },
    {
      href: "/dashboard/review",
      icon: Brain,
      label: "مرور",
      active: pathname.startsWith("/dashboard/review"),
    },
    {
      href: "/profile",
      icon: User,
      label: "پروفایل",
      active: pathname.startsWith("/profile"),
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-300 dark:border-gray-700/50 z-50 md:hidden overflow-hidden transition-colors duration-300">
      <div className="flex justify-between items-center px-1 py-1 max-w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center p-1 rounded-lg transition-all duration-200 flex-1 mx-0.5 min-w-0 w-full max-w-[20%] ${
                item.active
                  ? 'bg-cyan-500/15 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-800/30'
              }`}
            >
              <div className="relative p-1.5">
                <Icon className="h-4 w-4" />
                {item.active && (
                  <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-cyan-600 dark:bg-cyan-400 rounded-full animate-pulse"></div>
                )}
              </div>
              <span className="text-[10px] font-medium leading-tight mt-0.5 text-center whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}