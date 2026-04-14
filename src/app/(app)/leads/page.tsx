import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadsView } from "@/components/leads/leads-view";
import { getLeads } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            <span className="gradient-text">Leads</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Arraste entre colunas para avançar o estágio. Clique pra abrir o
            detalhe.
          </p>
        </div>
        <Button asChild size="sm" className="animate-glow-pulse">
          <Link href="/leads/new">
            <Plus />
            Novo Lead
          </Link>
        </Button>
      </header>

      <LeadsView leads={leads} />
    </div>
  );
}
