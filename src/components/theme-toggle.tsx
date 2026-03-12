"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "paytocommit-theme";

type ThemeMode = "light" | "dark";

function resolvePreferredTheme(): ThemeMode {
  if (typeof document !== "undefined") {
    const activeTheme = document.documentElement.dataset.theme;
    if (activeTheme === "light" || activeTheme === "dark") {
      return activeTheme;
    }
  }

  if (typeof window === "undefined") {
    return "dark";
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return "dark";
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem(STORAGE_KEY, theme);
}

export function ThemeToggle({ label = true }: { label?: boolean }) {
  const [theme, setTheme] = useState<ThemeMode>(resolvePreferredTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  const nextThemeLabel = theme === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextThemeLabel} mode`}
      title={`Switch to ${nextThemeLabel} mode`}
      suppressHydrationWarning
    >
      <span className="theme-toggle-track" data-theme={theme} suppressHydrationWarning>
        <SunMedium size={16} />
        <span className="theme-toggle-thumb" />
        <MoonStar size={16} />
      </span>
      {label ? (
        <span className="theme-toggle-label" suppressHydrationWarning>
          {theme === "light" ? "Light" : "Dark"}
        </span>
      ) : null}
    </button>
  );
}
