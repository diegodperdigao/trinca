"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[AppError]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl py-10">
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Erro nesta tela
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Encontramos um problema ao carregar esta página. Suas informações
            não foram perdidas — tente recarregar, e se persistir volte pro
            dashboard.
          </p>
          {error?.message && (
            <p className="mx-auto mt-3 max-w-md break-words rounded-md border border-border bg-secondary/60 px-3 py-2 text-[11px] font-mono text-muted-foreground">
              {error.message}
            </p>
          )}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
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
        </CardContent>
      </Card>
    </div>
  );
}
