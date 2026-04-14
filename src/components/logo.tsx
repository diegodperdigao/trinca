import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const LOGO_URL = "https://i.ibb.co/jvzrDqwM/logo-trinca-1.png";
export const FAVICON_URL = "https://i.ibb.co/DHfTRTh4/favicon.png";

// Proporção original do PNG oficial: 200 × 87 ≈ 2.3 : 1
const LOGO_RATIO = 200 / 87;

const SIZES = {
  sm: 28,
  md: 40,
  lg: 72,
} as const;

/**
 * Logo oficial Trinca do iGaming.
 * - `sm` — header mobile (28px alt)
 * - `md` — sidebar desktop (40px alt)
 * - `lg` — login / splash (72px alt)
 *
 * Renderiza diretamente <Image /> sem wrapper pra não bagunçar
 * alinhamento em containers flex.
 */
export function Logo({ className, size = "md" }: LogoProps) {
  const height = SIZES[size];
  const width = Math.round(height * LOGO_RATIO);

  return (
    <Image
      src={LOGO_URL}
      alt="Trinca do iGaming"
      width={width}
      height={height}
      priority={size === "lg"}
      unoptimized
      className={cn(
        "block select-none object-contain",
        size === "lg" &&
          "drop-shadow-[0_0_32px_rgba(242,24,40,0.45)] dark:drop-shadow-[0_0_32px_rgba(242,24,40,0.55)]",
        size === "md" &&
          "drop-shadow-[0_0_10px_rgba(242,24,40,0.25)] dark:drop-shadow-[0_0_12px_rgba(242,24,40,0.35)]",
        className,
      )}
      style={{ height: `${height}px`, width: "auto" }}
    />
  );
}
