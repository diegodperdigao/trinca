import Link from "next/link";
import { SearchX, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-dvh max-w-md place-items-center px-6">
      <div className="text-center">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
          <SearchX className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Página não encontrada
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          A página que você tentou acessar não existe ou foi movida.
        </p>
        <div className="mt-5">
          <Button asChild>
            <Link href="/dashboard">
              <Home />
              Voltar ao início
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
