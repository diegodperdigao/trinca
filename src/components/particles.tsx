"use client";

import { useMemo } from "react";

interface ParticlesProps {
  count?: number;
  className?: string;
}

/**
 * Floating red particles background from the Trinca visual guide.
 * Generated once on mount — deterministic enough for SSR + no re-render jitter.
 */
export function Particles({ count = 40, className }: ParticlesProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        // deterministic-ish seeding by index
        const r = (n: number) => ((Math.sin(i * 9.12 + n) + 1) / 2);
        const size = 1 + r(1) * 2.5;
        return {
          key: i,
          left: r(2) * 100,
          top: r(3) * 100,
          size,
          opacity: 0.4 + r(4) * 0.6,
          delay: -(r(5) * 15),
          duration: 10 + r(6) * 10,
        };
      }),
    [count],
  );

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {particles.map((p) => (
        <span
          key={p.key}
          className="absolute rounded-full bg-primary animate-float"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
