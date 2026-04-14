import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Trinca do iGaming — logo oficial inline SVG.
 *
 * Por que inline SVG em vez do PNG oficial?
 * O PNG tem texto branco sobre fundo transparente, então fica invisível
 * no light mode. Com SVG inline, o texto usa `currentColor` e adapta
 * automaticamente ao tema (text-foreground do Tailwind), enquanto o
 * triângulo mantém o vermelho do brand.
 *
 * Layouts:
 * - `sm` / `md`: horizontal (triângulo à esquerda + wordmark)
 * - `lg`: vertical grande (triângulo em cima + wordmark abaixo)
 */
export function Logo({ className, size = "md" }: LogoProps) {
  if (size === "lg") {
    return <LogoVertical className={className} />;
  }
  return <LogoHorizontal className={className} size={size} />;
}

function LogoHorizontal({
  className,
  size,
}: {
  className?: string;
  size: "sm" | "md";
}) {
  const height = size === "sm" ? 28 : 36;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 260 72"
      height={height}
      className={cn(
        "block w-auto select-none text-foreground",
        "drop-shadow-[0_0_10px_rgba(242,24,40,0.25)] dark:drop-shadow-[0_0_14px_rgba(242,24,40,0.4)]",
        className,
      )}
      style={{ height: `${height}px` }}
      aria-label="Trinca do iGaming"
    >
      <TriangleMark x={0} y={6} size={60} />
      <g transform="translate(74, 0)">
        <text
          x="0"
          y="42"
          fontFamily="Inter, sans-serif"
          fontSize="32"
          fontWeight="900"
          letterSpacing="2"
          fill="currentColor"
        >
          ATRINCA
        </text>
        <text
          x="2"
          y="60"
          fontFamily="Inter, sans-serif"
          fontSize="9"
          fontWeight="600"
          letterSpacing="5.5"
          fill="currentColor"
          opacity="0.65"
        >
          DO IGAMING
        </text>
      </g>
    </svg>
  );
}

function LogoVertical({ className }: { className?: string }) {
  const height = 120;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 260 150"
      height={height}
      className={cn(
        "block w-auto select-none text-foreground",
        "drop-shadow-[0_0_24px_rgba(242,24,40,0.35)] dark:drop-shadow-[0_0_32px_rgba(242,24,40,0.55)]",
        className,
      )}
      style={{ height: `${height}px` }}
      aria-label="Trinca do iGaming"
    >
      {/* Triângulo centralizado em cima */}
      <TriangleMark x={100} y={0} size={60} />

      {/* Wordmark */}
      <g transform="translate(0, 85)">
        <text
          x="130"
          y="32"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontSize="36"
          fontWeight="900"
          letterSpacing="3"
          fill="currentColor"
        >
          ATRINCA
        </text>
        <text
          x="130"
          y="52"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontSize="11"
          fontWeight="600"
          letterSpacing="7"
          fill="currentColor"
          opacity="0.65"
        >
          DO IGAMING
        </text>
      </g>
    </svg>
  );
}

/**
 * Marca triangular do brand. Triângulo outline vermelho com
 * destaque interno — sempre vermelho, independente do tema.
 */
function TriangleMark({
  x,
  y,
  size,
}: {
  x: number;
  y: number;
  size: number;
}) {
  const h = Math.round(size * 0.93);
  return (
    <g transform={`translate(${x}, ${y})`}>
      <defs>
        <linearGradient id="triFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fc4053" />
          <stop offset="55%" stopColor="#f21828" />
          <stop offset="100%" stopColor="#b81425" />
        </linearGradient>
      </defs>
      {/* Triângulo outline vermelho */}
      <path
        d={`M ${size / 2} 4 L ${size - 4} ${h - 4} L 4 ${h - 4} Z`}
        fill="none"
        stroke="url(#triFill)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Destaque interno — pequena linha inclinada no canto inferior direito */}
      <path
        d={`M ${size * 0.35} ${h - 10} L ${size * 0.55} ${h - 10}`}
        stroke="#f21828"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Detalhe ponta superior */}
      <circle cx={size / 2} cy={6} r="2" fill="#fc4053" />
    </g>
  );
}
