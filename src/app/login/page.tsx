"use client";

import { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/logo";
import { Embers } from "@/components/embers";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Loader2, LogIn, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginShell />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginShell() {
  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-background">
      <Embers count={50} />
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-md items-center justify-center px-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const supabase = createSupabaseBrowserClient();

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("invalid login credentials")) {
          setError("E-mail ou senha incorretos.");
        } else if (msg.includes("email not confirmed")) {
          setError(
            "E-mail ainda não confirmado. Verifique sua caixa de entrada.",
          );
        } else {
          setError(error.message);
        }
        return;
      }

      router.replace(nextPath);
      router.refresh();
    });
  }

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-background">
      {/* Fire base — brasa acumulada na parte de baixo da tela */}
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

      {/* Embers subindo */}
      <Embers count={70} />

      {/* Tema toggle — com label pra não ter como errar */}
      <div
        className="absolute right-4 top-4 z-20 flex animate-fade-in-down items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 backdrop-blur"
        style={{ animationDelay: "0.4s" }}
      >
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Tema
        </span>
        <ThemeToggle />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 py-10">
        <div
          className="mb-10 animate-fade-in-down"
          style={{ animationDelay: "0.05s" }}
        >
          <Logo size="lg" />
        </div>

        <div
          className="relative w-full animate-fade-in-up overflow-hidden rounded-2xl border border-border bg-gradient-card p-6 shadow-2xl backdrop-blur-xl md:p-8"
          style={{ animationDelay: "0.25s" }}
        >
          {/* Gradient border shimmer on top edge */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
          />

          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            Acesse o{" "}
            <span
              className="inline-block bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #fc4053 0%, #f21828 25%, #fc4053 50%, #f21828 75%, #b81425 100%)",
                backgroundSize: "200% 100%",
                animation: "text-shimmer 4s ease-in-out infinite",
                WebkitBackgroundClip: "text",
              }}
            >
              painel
            </span>
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Uso exclusivo de operadores autorizados da Trinca do iGaming.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0.45s" }}
            >
              <label
                htmlFor="email"
                className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="voce@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0.55s" }}
            >
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Senha
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-medium text-primary transition hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted-foreground transition hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="animate-fade-in rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-400">
                {error}
              </p>
            )}

            <div
              className="animate-fade-in-up"
              style={{ animationDelay: "0.65s" }}
            >
              <Button
                type="submit"
                size="lg"
                className="w-full animate-glow-pulse"
                disabled={pending}
              >
                {pending ? <Loader2 className="animate-spin" /> : <LogIn />}
                {pending ? "Entrando..." : "Entrar"}
              </Button>
            </div>

            <p
              className="animate-fade-in-up text-center text-[11px] text-muted-foreground"
              style={{ animationDelay: "0.75s" }}
            >
              Acesso restrito. Contate o administrador se não tiver cadastro.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
