import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const LOGO_URL = "https://i.ibb.co/jvzrDqwM/logo-trinca-1.png";
export const FAVICON_URL = "https://i.ibb.co/DHfTRTh4/favicon.png";

// Proporção original do PNG oficial: 200x87 ≈ 2.3:1
const RATIO = 200 / 87;

/**
 * Logo oficial da Trinca do iGaming.
 * - `sm`: altura 24 (header mobile, inline)
 * - `md`: altura 36 (sidebar desktop)
 * - `lg`: altura 64 (login / splash)
 */
export function Logo({ className, size = "md" }: LogoProps) {
  const height = size === "sm" ? 24 : size === "lg" ? 64 : 36;
  const width = Math.round(height * RATIO);

  return (
    <div
      className={cn(
        "relative inline-flex items-center",
        size === "lg" && "drop-shadow-[0_0_24px_rgba(242,24,40,0.35)]",
        size === "md" && "drop-shadow-[0_0_12px_rgba(242,24,40,0.3)]",
        className,
      )}
      aria-label="Trinca do iGaming"
    >
      <Image
        src={LOGO_URL}
        alt="Trinca do iGaming"
        width={width}
        height={height}
        priority={size === "lg"}
        className="h-auto w-auto select-none"
        style={{ height, width: "auto" }}
        unoptimized
      />
    </div>
  );
}
