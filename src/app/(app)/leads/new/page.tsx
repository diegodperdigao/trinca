import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LeadForm } from "@/components/leads/lead-form";

export default function NewLeadPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        href="/leads"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" />
        Voltar
      </Link>

      <header>
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
          Novo Lead
        </h1>
        <p className="text-sm text-muted-foreground">
          Cadastre um lead para o pipeline. Você pode anexar evidências depois.
        </p>
      </header>

      <Card>
        <CardContent className="pt-6">
          <LeadForm />
        </CardContent>
      </Card>
    </div>
  );
}
