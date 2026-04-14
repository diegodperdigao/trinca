"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Root error boundary — catches anything that escapes nested error.tsx.
 * Renderizado com <html>+<body> porque substitui o root layout quando
 * o erro vem do próprio RootLayout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="pt-BR" className="dark">
      <body
        style={{
          fontFamily:
            "Inter, system-ui, -apple-system, sans-serif",
          background: "#070907",
          color: "#f8f6f2",
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            maxWidth: "32rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-grid",
              placeItems: "center",
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "rgba(242, 24, 40, 0.12)",
              color: "#f21828",
              marginBottom: "1.5rem",
            }}
          >
            <AlertTriangle size={32} />
          </div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              margin: "0 0 0.75rem",
            }}
          >
            Algo deu errado.
          </h1>
          <p
            style={{
              fontSize: "0.9rem",
              color: "#a0a09d",
              margin: "0 0 1.5rem",
            }}
          >
            Um erro inesperado travou a aplicação. Seus dados estão
            seguros — nada foi perdido.
          </p>
          {error?.digest && (
            <p
              style={{
                fontSize: "0.7rem",
                fontFamily: "monospace",
                color: "#6a6a68",
                margin: "0 0 1.5rem",
              }}
            >
              ref: {error.digest}
            </p>
          )}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Button onClick={reset}>
              <RotateCcw />
              Tentar novamente
            </Button>
            <Button asChild variant="secondary">
              <Link href="/dashboard">
                <Home />
                Voltar ao início
              </Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
