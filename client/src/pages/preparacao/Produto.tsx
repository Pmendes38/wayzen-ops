import AdminPageEditor from "@/components/AdminPageEditor";
import PreparacaoNoteSection from "@/components/PreparacaoNoteSection";
import PreparacaoPageLayout from "@/components/PreparacaoPageLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminPageConfig } from "@/hooks/useAdminPageConfig";
import { AlertCircle, ArrowRight, CheckCircle2, Package2, TrendingUp } from "lucide-react";

const defaultConfig = {
  title: "Definição do Produto",
  description: "Nome do serviço, promessa central, vocabulário do nicho e entregáveis dos 4 sprints.",
  serviceSectionTitle: "Nome e método do serviço",
  serviceRows: [
    {
      label: "Serviço",
      value: "RevOps → Educational Revenue Operations (Método ERO's)",
      italic: false,
    },
    {
      label: "Promessa central",
      value: '"Sua escola vai matricular mais e o aluno que entra fica. E você vai saber exatamente por quê."',
      italic: true,
    },
  ],
  vocabularySectionTitle: "Vocabulário do nicho",
  vocabulary: [
    "Aluno (não Lead)",
    "Matrículas (não Vendas)",
    "Balde Furado",
    "Motor de matrícula",
    "Receita previsível",
    "Permanência do aluno",
  ],
  deliverablesSectionTitle: "O que o cliente recebe ao final dos 4 sprints",
  deliverableGroups: [
    {
      title: "Documentação e Processo",
      icon: "package",
      items: [
        "Playbook comercial completo — scripts de abordagem, objeções, checklist de atendimento e padrão de proposta",
        "Funil estruturado — etapas claras, campos obrigatórios, motivos de perda mapeados",
      ],
    },
    {
      title: "Métricas e Visibilidade",
      icon: "trending-up",
      items: [
        "KPIs e painel — resposta, follow-up, propostas, conversão e receita",
        "Relatório comparativo antes/depois — evidência concreta do que mudou",
        "Previsibilidade de receita — funil organizado por etapa com projeção",
      ],
    },
    {
      title: "Time Capacitado",
      icon: "check-circle",
      items: [
        "Treinamento prático com simulações reais — o time internaliza o processo",
        "Script campeão consolidado — validado em campo, não teoria",
      ],
    },
    {
      title: "Continuidade",
      icon: "arrow-right",
      items: [
        "Plano de 60 dias — próximo ciclo definido com base nos números",
        "3 rotas de saída — continua com a Wayzen, manutenção híbrida, ou transferência total do método",
      ],
    },
  ],
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

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PreparacaoProduto() {
  const { config, isAdmin } = useAdminPageConfig("preparacao.produto", defaultConfig);

  const iconMap = {
    package: <Package2 className="h-4 w-4 text-primary" />,
    "trending-up": <TrendingUp className="h-4 w-4 text-blue-400" />,
    "check-circle": <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
    "arrow-right": <ArrowRight className="h-4 w-4 text-amber-400" />,
  } as const;

  return (
    <PreparacaoPageLayout
      title={config.title}
      description={config.description}
      actions={isAdmin ? <AdminPageEditor pageKey="preparacao.produto" defaults={defaultConfig} /> : null}
    >
      <SectionCard title={config.serviceSectionTitle}>
        <div className="space-y-2">
          {config.serviceRows.map((row, index) => (
            <div key={`${row.label}-${index}`} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 border-b border-border/40 pb-2 last:border-b-0 last:pb-0">
              <span className="min-w-[160px] font-medium text-foreground/80">{row.label}</span>
              <span className={row.italic ? "text-foreground italic" : "text-foreground"}>{row.value}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title={config.vocabularySectionTitle}>
        <div className="flex flex-wrap gap-2">
          {config.vocabulary.map((item) => (
            <Badge key={item} variant="secondary">{item}</Badge>
          ))}
        </div>
      </SectionCard>

      <SectionCard title={config.deliverablesSectionTitle}>
        <div className="grid sm:grid-cols-2 gap-4">
          {config.deliverableGroups.map((group) => (
            <div key={group.title} className="space-y-2">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                {iconMap[group.icon as keyof typeof iconMap] ?? <AlertCircle className="h-4 w-4 text-primary" />} {group.title}
              </p>
              <BulletList items={group.items} />
            </div>
          ))}
        </div>
      </SectionCard>

      <PreparacaoNoteSection section="produto" />
    </PreparacaoPageLayout>
  );
}
