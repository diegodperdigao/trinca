"use client";

import { useMemo } from "react";
import type { CSSProperties } from "react";

interface EmbersProps {
  count?: number;
  className?: string;
}

/**
 * Efeito de cinzas de fogo (embers) vermelhas, como no site institucional
 * da Trinca. As partículas nascem no base da tela, sobem lentamente com
 * leve sway lateral, fazem fade in → pico → fade out, e some no topo.
 *
 * - Mix de 3 tamanhos: micro (1-2px), small (2-4px), big (4-7px com glow forte)
 * - Durações variadas: 10-28s pra dar sensação de caos orgânico
 * - Delays negativos garantem que já começam espalhadas na primeira tela
 */
export function Embers({ count = 60, className }: EmbersProps) {
  const embers = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const r = (n: number) => (Math.sin(i * 17.31 + n * 3.7) + 1) / 2;
        const sizeSeed = r(1);
        const isBig = sizeSeed > 0.82;
        const isSmall = !isBig && sizeSeed > 0.55;
        const size = isBig
          ? 4 + r(7) * 3 // 4-7px
          : isSmall
            ? 2 + r(7) * 2 // 2-4px
            : 1 + r(7) * 1.5; // 1-2.5px

        return {
          key: i,
          left: r(2) * 100,
          startBottom: -(10 + r(8) * 40), // começa logo abaixo da tela
          size,
          duration: 12 + r(3) * 16, // 12-28s
          delay: -(r(4) * 28), // -28 a 0s, pra estar espalhado em t=0
          opacity: isBig ? 0.7 + r(5) * 0.3 : isSmall ? 0.5 + r(5) * 0.4 : 0.3 + r(5) * 0.4,
          sway: (r(6) - 0.5) * 140, // sway lateral total em px
          isBig,
          isSmall,
        };
      }),
    [count],
  );

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {embers.map((e) => {
        const style: CSSProperties & Record<string, string | number> = {
          left: `${e.left}%`,
          bottom: `${e.startBottom}px`,
          width: `${e.size}px`,
          height: `${e.size}px`,
          animation: `ember-rise ${e.duration}s linear ${e.delay}s infinite`,
          ["--ember-opacity" as string]: `${e.opacity}`,
          ["--ember-sway" as string]: `${e.sway}px`,
          background: e.isBig
            ? "radial-gradient(circle, #ffb4a2 0%, #fc4053 30%, #f21828 60%, transparent 100%)"
            : e.isSmall
              ? "radial-gradient(circle, #fc4053 0%, #f21828 70%, transparent 100%)"
              : "#f21828",
          borderRadius: "9999px",
          boxShadow: e.isBig
            ? `0 0 ${e.size * 4}px rgba(242, 24, 40, 0.9), 0 0 ${e.size * 10}px rgba(252, 44, 65, 0.5)`
            : e.isSmall
              ? `0 0 ${e.size * 3}px rgba(242, 24, 40, 0.6)`
              : `0 0 ${e.size * 2}px rgba(242, 24, 40, 0.4)`,
          willChange: "transform, opacity",
        };
        return <span key={e.key} className="absolute" style={style} />;
      })}
    </div>
  );
}
