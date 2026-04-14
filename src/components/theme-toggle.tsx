"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "icon" | "inline";
}

export function ThemeToggle({ className, variant = "icon" }: ThemeToggleProps) {
  const { theme, toggle, mounted } = useTheme();

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={!mounted}
        aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
        className={cn(
          "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
          className,
        )}
      >
        <span className="relative h-4 w-4">
          <Sun
            className={cn(
              "absolute inset-0 h-4 w-4 transition-all duration-500",
              theme === "dark"
                ? "rotate-90 scale-0 opacity-0"
                : "rotate-0 scale-100 opacity-100",
            )}
          />
          <Moon
            className={cn(
              "absolute inset-0 h-4 w-4 transition-all duration-500",
              theme === "dark"
                ? "rotate-0 scale-100 opacity-100"
                : "-rotate-90 scale-0 opacity-0",
            )}
          />
        </span>
        <span>{theme === "dark" ? "Modo escuro" : "Modo claro"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={!mounted}
      aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
        className,
      )}
    >
      <span className="relative h-4 w-4">
        <Sun
          className={cn(
            "absolute inset-0 h-4 w-4 transition-all duration-500",
            theme === "dark"
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100",
          )}
        />
        <Moon
          className={cn(
            "absolute inset-0 h-4 w-4 transition-all duration-500",
            theme === "dark"
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0",
          )}
        />
      </span>
    </button>
  );
}
