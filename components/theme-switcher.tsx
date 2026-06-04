"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center justify-start gap-2 rounded-[34px] bg-neutral-100 p-1 outline outline-1 outline-offset-[-1px] outline-neutral-300 transition-all hover:opacity-80 dark:bg-[#252525] dark:outline-neutral-700"
      aria-label="Toggle theme"
    >
      {/* Sun icon (shown when in light mode) */}
      <div
        className={`flex items-center justify-center gap-2.5 rounded-3xl bg-blue-700 p-1 transition-opacity ${
          isDark ? "opacity-0" : "opacity-100"
        }`}
      >
        <Sun className="h-3.5 w-3.5 text-white" />
      </div>
      {/* Moon icon (shown when in dark mode) */}
      <div
        className={`flex items-center justify-center gap-2.5 rounded-3xl bg-white p-1 transition-opacity ${
          isDark ? "opacity-100" : "opacity-0"
        }`}
      >
        <Moon className="h-3.5 w-3.5 text-black" />
      </div>
    </button>
  );
}
