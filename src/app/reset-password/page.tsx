"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { Embers } from "@/components/embers";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Loader2, Save, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  // Quando o user clica no link do e-mail, o Supabase SSR client já cria
  // uma sessão temporária. Confirmamos isso aqui antes de permitir o reset.
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      setCheckingSession(false);
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
        return;
      }
      setDone(true);
      setTimeout(() => {
        router.replace("/dashboard");
        router.refresh();
      }, 1500);
    });
  }

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70vh]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, hsl(var(--primary) / 0.35) 0%, hsl(var(--primary) / 0.12) 25%, transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 animate-breathe"
        style={{
          background:
            "linear-gradient(to top, hsl(var(--primary) / 0.25), transparent)",
        }}
      />
      <Embers count={70} />

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
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            Nova senha
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Defina uma senha forte com no mínimo 8 caracteres.
          </p>

          {checkingSession ? (
            <div className="mt-6 flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : !hasSession ? (
            <div className="mt-6 rounded-md border border-red-500/30 bg-red-500/5 p-3 text-xs text-red-300">
              Link inválido ou expirado. Peça um novo em{" "}
              <a href="/forgot-password" className="underline">
                esqueci minha senha
              </a>
              .
            </div>
          ) : done ? (
            <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <div>
                  <p className="font-semibold text-foreground">
                    Senha atualizada!
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Redirecionando pro dashboard...
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Nova senha
                </label>
                <div className="relative mt-1.5">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Confirmar senha
                </label>
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
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
                {pending ? <Loader2 className="animate-spin" /> : <Save />}
                Salvar nova senha
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
