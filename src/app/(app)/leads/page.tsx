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
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            Leads
          </h1>
          <p className="text-sm text-muted-foreground">
            Arraste entre colunas para avançar o estágio. Clique pra abrir o
            detalhe.
          </p>
        </div>
        <Button asChild size="sm">
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
