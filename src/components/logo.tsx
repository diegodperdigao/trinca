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
  lg: 80,
} as const;

/**
 * Logo oficial Trinca do iGaming.
 * Usa <img> plano pra ter comportamento previsível em flex containers
 * (next/image estava gerando espaço extra por causa do wrapper + dimensões
 * intrínsecas).
 */
export function Logo({ className, size = "md" }: LogoProps) {
  const height = SIZES[size];

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_URL}
      alt="Trinca do iGaming"
      height={height}
      className={cn(
        "block w-auto max-w-none select-none",
        size === "lg" &&
          "drop-shadow-[0_0_32px_rgba(242,24,40,0.5)] dark:drop-shadow-[0_0_32px_rgba(242,24,40,0.6)]",
        size === "md" &&
          "drop-shadow-[0_0_10px_rgba(242,24,40,0.3)] dark:drop-shadow-[0_0_14px_rgba(242,24,40,0.4)]",
        className,
      )}
      style={{ height: `${height}px` }}
      draggable={false}
    />
  );
}
