// components/MobileNavBar.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Video, Brain, User } from "lucide-react";

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
      active: pathname === "/dashboard",
    },
    {
      href: "/video-levels",
      icon: Video,
      active: pathname.startsWith("/video"),
    },
    {
      href: "/dashboard/review",
      icon: Brain,
      active: pathname.startsWith("/dashboard/review"),
    },
    {
      href: "/profile",
      icon: User,
      active: pathname.startsWith("/profile"),
    },
  ];

  return (
    <>
      {/* Glass blur effect */}
      <div className="fixed bottom-2 inset-x-4 z-50 md:hidden">
        {/* Glass container with oval shape */}
        <div className="relative bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-lg shadow-black/5 dark:shadow-gray-900/10 rounded-[32px] p-2 overflow-hidden">
          
          {/* Frosted glass texture */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.05),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_50%_120%,rgba(100,100,120,0.05),rgba(0,0,0,0))]"></div>
          
          {/* Inner subtle border */}
          <div className="absolute inset-0 rounded-[32px] p-[1px]">
            <div className="h-full w-full rounded-[31px] bg-gradient-to-r from-transparent via-gray-300/10 dark:via-gray-600/10 to-transparent"></div>
          </div>
          
          {/* Navigation items */}
          <div className="relative flex justify-between items-center px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative group flex-1 flex items-center justify-center"
                >
                  {/* Active background - خنثی‌تر */}
                  {item.active && (
                    <div className="absolute -inset-2 rounded-[24px] bg-gray-300/20 dark:bg-gray-700/20"></div>
                  )}
                  
                  {/* Icon container - کوچکتر و خنثی‌تر */}
                  <div className={`relative z-10 p-2.5 rounded-[18px] transition-all duration-200 ${
                    item.active 
                      ? 'bg-gray-800 dark:bg-gray-700 shadow-sm' 
                      : 'bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/40 dark:group-hover:bg-gray-700/40'
                  }`}>
                    <Icon className={`h-4 w-4 transition-all ${
                      item.active 
                        ? 'text-white' 
                        : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200'
                    }`} />
                    
                    {/* Active dot - خنثی‌تر */}
                    {item.active && (
                      <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-gray-300 dark:bg-gray-400 rounded-full"></div>
                    )}
                  </div>
                  
                  {/* Hover effect - ساده‌تر */}
                  {!item.active && (
                    <div className="absolute -inset-2 rounded-[20px] bg-transparent group-hover:bg-gray-200/10 dark:group-hover:bg-gray-700/10 transition-all duration-200"></div>
                  )}
                </Link>
              );
            })}
          </div>
          
          {/* Center decorative element - حذف یا خنثی‌تر */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gray-300/5 dark:bg-gray-600/5 rounded-full blur-md"></div>
        </div>
      </div>
      
      {/* Bottom blur overlay - خنثی‌تر */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/20 dark:from-gray-900/20 to-transparent backdrop-blur-sm z-40 md:hidden pointer-events-none"></div>
    </>
  );
}