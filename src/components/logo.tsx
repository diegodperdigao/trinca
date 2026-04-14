import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Trinca do iGaming brand mark.
 * - `sm`: só o triângulo (favicon/avatar)
 * - `md`: triângulo + wordmark compacto (header / sidebar)
 * - `lg`: triângulo grande + wordmark completo (login / splash)
 */
export function Logo({ className, size = "md" }: LogoProps) {
  if (size === "sm") {
    return <TriangleMark size={28} className={className} />;
  }

  if (size === "lg") {
    return (
      <div className={cn("flex flex-col items-center gap-4", className)}>
        <TriangleMark size={64} />
        <div className="flex flex-col items-center leading-none">
          <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            A trinca do
          </span>
          <span className="mt-1.5 text-3xl font-extrabold uppercase tracking-[0.08em] text-foreground">
            iGaming
          </span>
        </div>
      </div>
    );
  }

  // md (default)
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <TriangleMark size={28} />
      <div className="flex flex-col leading-none">
        <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          A trinca do
        </span>
        <span className="mt-0.5 text-sm font-extrabold uppercase tracking-[0.08em] text-foreground">
          iGaming
        </span>
      </div>
    </div>
  );
}

interface TriangleMarkProps {
  size?: number;
  className?: string;
}

function TriangleMark({ size = 28, className }: TriangleMarkProps) {
  // Triângulo com proporção visual da marca Trinca (ícone do site institucional).
  const w = size;
  const h = Math.round(size * 0.93);
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 60 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "drop-shadow-[0_0_16px_rgba(242,24,40,0.5)]",
        className,
      )}
      aria-label="Trinca do iGaming"
    >
      <defs>
        <linearGradient id="triGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fc4053" />
          <stop offset="55%" stopColor="#f21828" />
          <stop offset="100%" stopColor="#b81425" />
        </linearGradient>
        <linearGradient id="triInner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      {/* Triângulo principal preenchido */}
      <path
        d="M30 4 L56 52 H4 Z"
        fill="url(#triGrad)"
        stroke="#fc4053"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Highlight sutil no topo */}
      <path
        d="M30 4 L56 52 H4 Z"
        fill="url(#triInner)"
        opacity="0.6"
      />
    </svg>
  );
}
