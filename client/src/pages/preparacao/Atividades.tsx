import AdminPageEditor from "@/components/AdminPageEditor";
import PreparacaoNoteSection from "@/components/PreparacaoNoteSection";
import PreparacaoPageLayout from "@/components/PreparacaoPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminPageConfig } from "@/hooks/useAdminPageConfig";
import { CheckCircle2 } from "lucide-react";

const defaultConfig = {
  title: "Atividades Práticas",
  description: "Checklists por frente para colocar a Wayzen de pé. Execução sem organização vira caos.",
  contextTitle: "Contexto",
  contextText:
    "Todo trabalho feito até aqui — definição do produto, ICP, processo comercial, onboarding, investimento — serve como base para a execução. Antes de dar qualquer passo, tenha clareza sobre o que fazer, quando fazer e quem é responsável por cada frente.",
  fronts: [
    {
      title: "Produto",
      items: [
        "Finalizar a definição do Método ERO's com documentação escrita",
        "Criar página de apresentação do serviço (site/one-pager)",
        "Gravar pitch de 1 minuto para cada etapa do funil",
      ],
    },
    {
      title: "Comercial",
      items: [
        "Mapear lista de 50 escolas ICP para prospecção",
        "Criar sequência de abordagem (mensagem inicial + follow ups)",
        "Montar template de proposta comercial",
        "Definir CRM ou planilha de controle das negociações",
      ],
    },
    {
      title: "Operação",
      items: [
        "Criar o portal de projetos (este portal!)",
        "Definir rotina de comunicação com o cliente (cadência semanal)",
        "Preparar template de relatório semanal",
        "Criar checklist de kickoff para cada novo projeto",
      ],
    },
    {
      title: "Marca",
      items: [
        "Aprovar identidade visual (logo, cores, tipografia)",
        "Produzir material de onboarding (carta + cartão VIP + envelopes)",
        "Fazer sessão fotográfica dos sócios",
        "Publicar primeiros conteúdos no LinkedIn",
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

export default function PreparacaoAtividades() {
  const { config, isAdmin } = useAdminPageConfig("preparacao.atividades", defaultConfig);

  return (
    <PreparacaoPageLayout
      title={config.title}
      description={config.description}
      actions={isAdmin ? <AdminPageEditor pageKey="preparacao.atividades" defaults={defaultConfig} /> : null}
    >
      <SectionCard title={config.contextTitle}>
        <p>{config.contextText}</p>
      </SectionCard>

      <div className="grid sm:grid-cols-2 gap-4">
        {config.fronts.map((front) => (
          <SectionCard key={front.title} title={front.title}>
            <BulletList items={front.items} />
          </SectionCard>
        ))}
      </div>

      <PreparacaoNoteSection section="atividades" />
    </PreparacaoPageLayout>
  );
}
