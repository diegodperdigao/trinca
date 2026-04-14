"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Particles } from "@/components/particles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ArrowLeft, CheckCircle2, Loader2, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const origin =
        process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          // Passa por /auth/callback pro SSR trocar code por sessão,
          // depois vai pro /reset-password onde o user define a nova senha.
          redirectTo: `${origin}/auth/callback?next=/reset-password`,
        },
      );

      if (error) {
        setError(error.message);
        return;
      }
      setSent(true);
    });
  }

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-background">
      <Particles count={50} />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[linear-gradient(to_bottom,rgba(252,44,65,0.18),transparent)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-72 bg-[linear-gradient(to_right,rgba(252,44,65,0.14),transparent)]" />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 py-10">
        <Logo size="lg" className="mb-10 animate-fade-in" />

        <div className="w-full rounded-2xl border border-border bg-gradient-card p-6 backdrop-blur md:p-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" />
            Voltar para login
          </Link>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight md:text-3xl">
            Recuperar senha
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Vamos te mandar um link por e-mail pra você criar uma senha nova.
          </p>

          {sent ? (
            <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <div>
                  <p className="font-semibold text-foreground">
                    Link enviado!
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Se o e-mail <strong>{email}</strong> tiver cadastro, um
                    link de redefinição vai chegar em até 1 minuto.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  E-mail
                </label>
                <Input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              {error && (
                <p className="rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-300">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={pending}
              >
                {pending ? <Loader2 className="animate-spin" /> : <Send />}
                {pending ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
