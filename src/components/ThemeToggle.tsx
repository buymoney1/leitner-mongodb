//components/ThemeToggle.tsx

"use client";

import { Sun, Moon, Monitor } from "lucide-react";


export function ThemeToggleCard() {
  const { theme, toggleTheme, mounted, isDark, isLight, isSystem } = useTheme();

  const getThemeIcon = () => {
    if (!mounted) return <Monitor className="h-4 w-4" />
    if (isDark) return <Moon className="h-4 w-4" />
    if (isLight) return <Sun className="h-4 w-4" />
    return <Monitor className="h-4 w-4" />
  }

  const getThemeLabel = () => {
    if (!mounted) return 'در حال بارگذاری...'
    if (isDark) return 'حالت تیره'
    if (isLight) return 'حالت روشن'
    return 'حالت سیستم'
  }

  const getThemeDescription = () => {
    if (!mounted) return 'در حال بارگذاری...'
    if (isDark) return 'مناسب برای استفاده در شب'
    if (isLight) return 'مناسب برای استفاده در روز'
    return 'پیروی از تنظیمات سیستم'
  }

  if (!mounted) {
    return (
      <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-2xl p-6 border border-amber-500/20 backdrop-blur-sm animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20"></div>
            <div className="space-y-2">
              <div className="h-4 bg-amber-500/20 rounded w-24"></div>
              <div className="h-3 bg-amber-500/20 rounded w-32"></div>
            </div>
          </div>
          <div className="w-20 h-10 bg-amber-500/20 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-2xl p-6 border border-amber-500/20 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
            {getThemeIcon()}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">تم نمایش</h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              {getThemeDescription()}
            </p>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors text-sm"
        >
          {getThemeIcon()}
          <span className="hidden sm:block">تغییر تم</span>
        </button>
      </div>
      <div className="mt-4 p-3 bg-amber-500/5 rounded-lg border border-amber-500/10">
        <p className="text-amber-700 dark:text-amber-300 text-sm text-center">
          حالت فعلی: <strong>{getThemeLabel()}</strong>
        </p>
      </div>
    </div>
  );
}