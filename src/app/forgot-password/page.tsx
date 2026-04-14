"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Embers } from "@/components/embers";
import { ThemeToggle } from "@/components/theme-toggle";
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
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[45vh]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 120%, hsl(var(--primary) / 0.18) 0%, hsl(var(--primary) / 0.05) 35%, transparent 70%)",
        }}
      />
      <Embers count={60} />

      <div className="absolute right-4 top-4 z-20 flex animate-fade-in-down items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 backdrop-blur">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Tema
        </span>
        <ThemeToggle />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 py-10">
        <div className="mb-10 animate-fade-in-down">
          <Logo size="lg" />
        </div>

        <div
          className="relative w-full animate-fade-in-up overflow-hidden rounded-2xl border border-border bg-gradient-card p-6 shadow-2xl backdrop-blur-xl md:p-8"
          style={{ animationDelay: "0.2s" }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
          />
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
