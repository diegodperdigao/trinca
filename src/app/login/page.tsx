"use client";

import { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/logo";
import { Particles } from "@/components/particles";
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
      <Particles count={50} />
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
        // Mensagem amigável em PT
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
      <Particles count={50} />

      {/* red glow top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[linear-gradient(to_bottom,rgba(252,44,65,0.18),transparent)]" />
      {/* red glow left */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-72 bg-[linear-gradient(to_right,rgba(252,44,65,0.14),transparent)]" />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 py-10">
        <Logo size="lg" className="mb-10 animate-fade-in" />

        <div className="w-full rounded-2xl border border-border bg-gradient-card p-6 backdrop-blur md:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            Acesse o{" "}
            <span className="bg-gradient-to-r from-[#fc4053] to-[#b81425] bg-clip-text text-transparent">
              painel
            </span>
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Uso exclusivo de operadores autorizados da Trinca do iGaming.
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
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

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Senha
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-medium text-primary hover:underline"
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
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
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

            {error && (
              <p className="rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-300">
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full animate-glow-pulse"
              disabled={pending}
            >
              {pending ? <Loader2 className="animate-spin" /> : <LogIn />}
              {pending ? "Entrando..." : "Entrar"}
            </Button>

            <p className="text-center text-[11px] text-muted-foreground">
              Acesso restrito. Contate o administrador se não tiver cadastro.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
