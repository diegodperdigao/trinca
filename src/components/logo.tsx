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
 * Logo oficial Trinca do iGaming (PNG hospedada no imgbb).
 *
 * Por que essa funciona nos dois temas mesmo sendo um PNG branco:
 * usamos o truque `filter: invert(1) hue-rotate(180deg)` em light mode.
 * - invert(1): inverte todas as cores RGB
 *   · branco (text) → preto ✓
 *   · vermelho (triângulo) → ciano ✗
 * - hue-rotate(180deg): rotaciona o matiz em 180°
 *   · preto → continua preto (grayscale não tem hue)
 *   · ciano → volta pra vermelho ✓
 *
 * Resultado: o texto fica legível em fundo branco E o vermelho do brand
 * fica preservado.
 *
 * As classes .logo-img / .dark .logo-img estão definidas em globals.css
 * pra lidar com a combinação do filter de inversão + drop-shadow no dark.
 */
export function Logo({ className, size = "md" }: LogoProps) {
  const height = SIZES[size];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
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
