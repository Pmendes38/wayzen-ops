import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      setLocation("/");
    }
  }, [loading, setLocation, user]);

  const handleLogin = () => {
    setIsRedirecting(true);
    window.location.href = "/api/auth/login";
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-5xl items-stretch gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6 sm:p-10">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Plataforma segura Wayzen
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Entre no painel da sua operacao
              </h1>
              <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
                Centralize preparacao, funis, sprints e playbooks em um unico fluxo de trabalho.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-background/70 p-4">
                  <p className="text-xs text-muted-foreground">Funis ativos</p>
                  <p className="mt-1 text-2xl font-bold text-primary">100%</p>
                </div>
                <div className="rounded-xl border border-border bg-background/70 p-4">
                  <p className="text-xs text-muted-foreground">Playbooks</p>
                  <p className="mt-1 text-2xl font-bold">Organizados</p>
                </div>
                <div className="rounded-xl border border-border bg-background/70 p-4">
                  <p className="text-xs text-muted-foreground">Cronograma</p>
                  <p className="mt-1 text-2xl font-bold">Monitorado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90 backdrop-blur-sm">
            <CardContent className="flex h-full flex-col justify-between p-6 sm:p-8">
              <div>
                <h2 className="text-xl font-semibold tracking-tight">Acessar conta</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Use o provedor OAuth da organizacao para autenticar com seguranca.
                </p>

                <Button
                  className="mt-8 h-11 w-full gap-2 text-sm font-semibold"
                  onClick={handleLogin}
                  disabled={loading || isRedirecting}
                >
                  {isRedirecting ? "Redirecionando..." : "Entrar com OAuth"}
                  {!isRedirecting ? <ArrowRight className="h-4 w-4" /> : null}
                </Button>
              </div>

              <div className="mt-6 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-100">
                <p className="flex items-start gap-2 leading-relaxed">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Se o ambiente ainda nao estiver configurado, o backend pode retornar a mensagem OAuth login is not configured.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
