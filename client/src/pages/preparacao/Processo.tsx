import AdminPageEditor from "@/components/AdminPageEditor";
import PreparacaoNoteSection from "@/components/PreparacaoNoteSection";
import PreparacaoPageLayout from "@/components/PreparacaoPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminPageConfig } from "@/hooks/useAdminPageConfig";
import { CheckCircle2 } from "lucide-react";

const defaultConfig = {
  title: "Processo Comercial da Wayzen",
  description: "Funil em 6 etapas estruturadas para a Wayzen vender seu próprio serviço.",
  funnelTitle: "Funil ideal (estruturado)",
  funnelSteps: [
    {
      title: "Prospecção",
      body: "Como será feita? Por quais canais? (tráfego pago, indicação, evento, LinkedIn, Empresa Aqui...)",
    },
    {
      title: "Qualificação",
      body: "Validar ICP. Usar cliente oculto quando necessário para entender a operação antes da abordagem.",
    },
    {
      title: "Diagnóstico ao vivo",
      body: "Reunião de 90 min mapeando o produto, metas, sazonalidade, preços, políticas e restrições.",
    },
    {
      title: "Apresentação da proposta",
      body: "Apresentação clara do Método ERO's, entregáveis dos 4 sprints, investimento e prazo.",
    },
    {
      title: "Fechamento",
      body: "Contrato assinado, pagamento confirmado, data de início definida.",
    },
    {
      title: "Onboarding",
      body: "Ver a seção Onboarding para o passo a passo detalhado do início do contrato.",
    },
  ],
  comparisonTitle: "Estado atual vs. ideal",
  currentTitle: "Hoje (simplificado)",
  currentSteps: ["Prospecção", "Reunião", "Diagnóstico", "Proposta"],
  targetTitle: "Meta (estruturado)",
  targetSteps: ["Prospecção", "Qualificação", "Diagnóstico ao vivo", "Apresentação da proposta", "Fechamento", "Onboarding"],
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">{children}</CardContent>
    </Card>
  );
}

function Step({ n, title, children }: { n: number; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
        {n}
      </div>
      <div className="space-y-1 pt-0.5">
        <p className="font-medium text-foreground">{title}</p>
        {children && <div className="text-muted-foreground">{children}</div>}
      </div>
    </div>
  );
}

export default function PreparacaoProcesso() {
  const { config, isAdmin } = useAdminPageConfig("preparacao.processo", defaultConfig);

  return (
    <PreparacaoPageLayout
      title={config.title}
      description={config.description}
      actions={isAdmin ? <AdminPageEditor pageKey="preparacao.processo" defaults={defaultConfig} /> : null}
    >
      <SectionCard title={config.funnelTitle}>
        <div className="space-y-3">
          {config.funnelSteps.map((step, index) => (
            <Step key={step.title} n={index + 1} title={step.title}>
              <p>{step.body}</p>
            </Step>
          ))}
        </div>
      </SectionCard>

      <SectionCard title={config.comparisonTitle}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="font-medium text-foreground mb-2">{config.currentTitle}</p>
            <ul className="space-y-1.5">
              {config.currentSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium text-foreground mb-2">{config.targetTitle}</p>
            <ul className="space-y-1.5">
              {config.targetSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionCard>

      <PreparacaoNoteSection section="processo" />
    </PreparacaoPageLayout>
  );
}
