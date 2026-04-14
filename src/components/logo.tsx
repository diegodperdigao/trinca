"use client";

import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const LOGO_URL = "https://i.ibb.co/jvzrDqwM/logo-trinca-1.png";
export const FAVICON_URL = "https://i.ibb.co/DHfTRTh4/favicon.png";

const SIZES = {
  sm: 32,
  md: 44,
  lg: 96,
} as const;

/**
 * Logo oficial Trinca do iGaming.
 *
 * Usa o PNG hospedada no imgbb + truque `filter: invert(1) hue-rotate(180deg)`
 * em globals.css pra o texto branco virar preto no light mode mantendo o
 * vermelho do triângulo.
 *
 * IMPORTANTE: `key={theme}` força remount do <img> quando o usuário alterna
 * o tema. Sem isso, alguns browsers (Chrome/Safari) cacheiam o bitmap
 * renderizado do filter antigo e a logo não repinta corretamente na
 * transição light → dark, mostrando texto preto invisível sobre fundo preto.
 * Remontar garante que o filter novo é calculado do zero.
 */
export function Logo({ className, size = "md" }: LogoProps) {
  const height = SIZES[size];
  const { theme } = useTheme();

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={theme}
      src={LOGO_URL}
      alt="Trinca do iGaming"
      className={cn(
        "logo-img block w-auto max-w-none select-none",
        size === "lg" && "logo-lg",
        size === "sm" && "logo-sm",
        className,
      )}
      style={{ height: `${height}px` }}
      draggable={false}
    />
  );
}
