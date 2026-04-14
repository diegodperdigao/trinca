"use client";

import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "trinca.theme";

function readStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

/**
 * Theme hook that stays in sync with the inline boot script in
 * app/layout.tsx. Reads current class on mount, persists on change.
 */
export function useTheme() {
  // Initial state matches whatever the boot script decided.
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = readStoredTheme();
    const currentClass = document.documentElement.classList.contains("light")
      ? "light"
      : "dark";
    setTheme(stored ?? currentClass);
  }, []);

  const setThemeSafe = useCallback((next: Theme) => {
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    applyTheme(next);
  }, []);

  const toggle = useCallback(() => {
    setThemeSafe(theme === "dark" ? "light" : "dark");
  }, [theme, setThemeSafe]);

  return { theme, setTheme: setThemeSafe, toggle, mounted };
}
