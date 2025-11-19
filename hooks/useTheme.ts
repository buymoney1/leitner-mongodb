"use client";

import { useTheme as useNextTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useTheme() {
  const { theme, setTheme, systemTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (theme === "dark" || (theme === "system" && systemTheme === "dark"));
  const isLight = mounted && (theme === "light" || (theme === "system" && systemTheme === "light"));
  const isSystem = mounted && theme === "system";

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("system");
    } else {
      setTheme("dark");
    }
  };

  const setThemeDirect = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
  };

  return {
    theme: mounted ? theme : "dark",
    setTheme: setThemeDirect,
    systemTheme,
    isDark,
    isLight,
    isSystem,
    mounted,
    toggleTheme
  };
}