import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Users, GraduationCap, TrendingUp, CheckCircle, Clock, FileText, AlertTriangle, ClipboardCheck } from "lucide-react";

export default function Home() {
  const { data: kpis, isLoading } = trpc.dashboard.kpis.useQuery({});

  const kpiCards = [
    {
      title: "Clientes Ativos",
      value: kpis?.activeClients ?? 0,
      icon: Users,
      accent: "#22c55e",
      bg: "rgba(34,197,94,0.10)",
    },
    {
      title: "Alunos no Funil",
      value: kpis?.openLeads ?? 0,
      icon: GraduationCap,
      accent: "#BF00FF",
      bg: "rgba(191,0,255,0.10)",
    },
    {
      title: "Matrículas do Mês",
      value: kpis?.wonLeads ?? 0,
      icon: TrendingUp,
      accent: "#10b981",
      bg: "rgba(16,185,129,0.10)",
    },
    {
      title: "Sprints em Atraso",
      value: kpis?.pendingTasks ?? 0,
      icon: AlertTriangle,
      accent: "#f59e0b",
      bg: "rgba(245,158,11,0.10)",
    },
    {
      title: "Total de Clientes",
      value: kpis?.totalClients ?? 0,
      icon: CheckCircle,
      accent: "#6366f1",
      bg: "rgba(99,102,241,0.10)",
    },
    {
      title: "Onboardings Pendentes",
      value: 0,
      icon: ClipboardCheck,
      accent: "#f97316",
      bg: "rgba(249,115,22,0.10)",
    },
  ];

  const conversionRate = kpis && kpis.totalLeads > 0
    ? ((kpis.wonLeads / kpis.totalLeads) * 100).toFixed(1)
    : "0.0";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral da operação Wayzen</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-16 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {kpiCards.map((kpi) => (
                <Card
                  key={kpi.title}
                  className="hover:card-glow transition-shadow border-border"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{kpi.title}</p>
                        <p className="text-3xl font-bold mt-1 font-mono" style={{ color: kpi.accent }}>
                          {kpi.value}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl" style={{ background: kpi.bg }}>
                        <kpi.icon className="h-6 w-6" style={{ color: kpi.accent }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="hover:card-glow transition-shadow border-border">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Taxa de Conversão</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold font-mono text-primary">{conversionRate}%</div>
                    <div className="text-sm text-muted-foreground">
                      {kpis?.wonLeads ?? 0} matrículas de {kpis?.totalLeads ?? 0} alunos
                    </div>
                  </div>
                  <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(parseFloat(conversionRate), 100)}%`,
                        background: "linear-gradient(90deg, #BF00FF, #7C3AED)",
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:card-glow transition-shadow border-border">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Funil de Alunos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">No funil</span>
                      <span className="font-semibold font-mono text-[#BF00FF]">{kpis?.openLeads ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Matriculados</span>
                      <span className="font-semibold font-mono text-emerald-400">{kpis?.wonLeads ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Perdidos</span>
                      <span className="font-semibold font-mono text-red-400">{kpis?.lostLeads ?? 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:card-glow transition-shadow border-border">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Atividades Pendentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Tarefas de Sprint</span>
                      <span className="font-semibold font-mono text-amber-400">{kpis?.pendingTasks ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Interações do Mês</span>
                      <span className="font-semibold font-mono text-indigo-400">{kpis?.totalInteractions ?? 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
