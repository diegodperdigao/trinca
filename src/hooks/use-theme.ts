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
 * Theme hook sincronizado entre QUALQUER consumer do app via
 * MutationObserver no <html>.
 *
 * Bug que isso resolve: cada useState é local ao componente. Se o
 * ThemeToggle usa useTheme e muda o state dele, o Logo (que também
 * usa useTheme) não é notificado — o state dele fica congelado no
 * valor inicial. Com MutationObserver, qualquer mudança na classe
 * do <html> dispara setTheme em todos os consumers, mantendo tudo
 * em sincronia.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;

    // Sincroniza initial state com a classe atual (setada pelo boot script)
    const initial: Theme = root.classList.contains("light") ? "light" : "dark";
    setThemeState(initial);

    // Observa qualquer mudança na classe do html → re-sincroniza state.
    // Isso garante que todas as instâncias de useTheme() ficam em
    // sincronia, mesmo sem um Context/Provider compartilhado.
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "class") {
          const next: Theme = root.classList.contains("light")
            ? "light"
            : "dark";
          setThemeState(next);
        }
      }
    });
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    applyTheme(next);
    // Não precisa chamar setThemeState — o MutationObserver vai pegar
    // a mudança da classe e sincronizar.
  }, []);

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggle, mounted };
}
