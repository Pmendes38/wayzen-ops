import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ClipboardCheck, CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

// Predefined 10-step Wayzen onboarding checklist
const ONBOARDING_STEPS = [
  { id: 1,  label: "Contrato assinado e enviado",                description: "Verificar assinatura e armazenamento do contrato no sistema." },
  { id: 2,  label: "Acesso ao CRM configurado",                  description: "Criar usuário e conceder permissões corretas na plataforma." },
  { id: 3,  label: "Kickoff realizado",                          description: "Reunião de alinhamento com todos os stakeholders do cliente." },
  { id: 4,  label: "Meta da primeira sprint definida",           description: "Estabelecer objetivo SMART para as primeiras 4 semanas." },
  { id: 5,  label: "Funil de alunos mapeado",                    description: "Documentar as 6 etapas do processo de captação do cliente." },
  { id: 6,  label: "Playbook inicial criado",                    description: "Script de vendas e matriz de objeções entregues ao time." },
  { id: 7,  label: "Primeiro sprint criado no sistema",          description: "Cadastrar sprint de 4 semanas com tarefas pré-definidas." },
  { id: 8,  label: "Treinamento da equipe realizado",            description: "Capacitar o time do cliente no uso da plataforma." },
  { id: 9,  label: "Primeiro relatório enviado",                 description: "Relatório de acompanhamento da semana 1 entregue." },
  { id: 10, label: "Check-in Day 30 agendado",                   description: "Agendar reunião de revisão após 30 dias de operação." },
] as const;

interface ClientProgress {
  completedSteps: Set<number>;
  expanded: boolean;
}

export default function Onboarding() {
  const { data: clients, isLoading } = trpc.clients.list.useQuery();

  // Track completion per client (local state; persists during session)
  const [progress, setProgress] = useState<Record<number, ClientProgress>>({});

  function toggleStep(clientId: number, stepId: number) {
    setProgress(prev => {
      const current = prev[clientId] ?? { completedSteps: new Set<number>(), expanded: true };
      const next = new Set(current.completedSteps);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return { ...prev, [clientId]: { ...current, completedSteps: next } };
    });
  }

  function toggleExpand(clientId: number) {
    setProgress(prev => {
      const current = prev[clientId] ?? { completedSteps: new Set<number>(), expanded: false };
      return { ...prev, [clientId]: { ...current, expanded: !current.expanded } };
    });
  }

  function getClientProgress(clientId: number) {
    return progress[clientId] ?? { completedSteps: new Set<number>(), expanded: false };
  }

  const activeClients = clients?.filter(c => c.status === "active" || c.status === "prospect") ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Onboarding</h1>
          <p className="text-muted-foreground">
            Checklist de 10 etapas para novos clientes — semana zero
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Circle className="h-4 w-4" />
            <span>Pendente</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Concluído</span>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-8 bg-muted rounded mb-4" />
                  <div className="h-40 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : activeClients.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Nenhum cliente ativo</h3>
              <p className="text-muted-foreground mt-1">
                Adicione clientes na seção Clientes para acompanhar o onboarding.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {activeClients.map(client => {
              const { completedSteps, expanded } = getClientProgress(client.id);
              const completedCount = completedSteps.size;
              const percentage = Math.round((completedCount / ONBOARDING_STEPS.length) * 100);
              const isComplete = completedCount === ONBOARDING_STEPS.length;

              return (
                <Card
                  key={client.id}
                  className={`border-border transition-shadow ${isComplete ? "card-glow" : ""}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold"
                          style={{
                            background: isComplete ? "rgba(34,197,94,0.15)" : "rgba(191,0,255,0.15)",
                            color: isComplete ? "#22c55e" : "#BF00FF",
                          }}
                        >
                          {client.companyName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-base truncate">{client.companyName}</CardTitle>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {completedCount}/{ONBOARDING_STEPS.length} etapas concluídas
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Progress pill */}
                        <div className="hidden sm:flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${percentage}%`,
                                background: isComplete
                                  ? "linear-gradient(90deg, #22c55e, #10b981)"
                                  : "linear-gradient(90deg, #BF00FF, #7C3AED)",
                              }}
                            />
                          </div>
                          <span
                            className="text-xs font-mono font-semibold"
                            style={{ color: isComplete ? "#22c55e" : "#BF00FF" }}
                          >
                            {percentage}%
                          </span>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => toggleExpand(client.id)}
                        >
                          {expanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Mobile progress bar */}
                    <div className="sm:hidden mt-3">
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            background: isComplete
                              ? "linear-gradient(90deg, #22c55e, #10b981)"
                              : "linear-gradient(90deg, #BF00FF, #7C3AED)",
                          }}
                        />
                      </div>
                    </div>
                  </CardHeader>

                  {expanded && (
                    <CardContent className="pt-0 pb-4">
                      <div className="space-y-1 border-t border-border pt-4">
                        {ONBOARDING_STEPS.map(step => {
                          const done = completedSteps.has(step.id);
                          return (
                            <button
                              key={step.id}
                              className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-accent group"
                              onClick={() => toggleStep(client.id, step.id)}
                            >
                              <div className="mt-0.5 shrink-0">
                                {done ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                ) : (
                                  <Circle className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="text-xs font-mono font-semibold text-muted-foreground"
                                  >
                                    {String(step.id).padStart(2, "0")}
                                  </span>
                                  <span
                                    className={`text-sm font-medium transition-colors ${
                                      done ? "line-through text-muted-foreground" : "text-foreground"
                                    }`}
                                  >
                                    {step.label}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 pl-6">
                                  {step.description}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
