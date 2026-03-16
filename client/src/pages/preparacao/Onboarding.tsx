import AdminPageEditor from "@/components/AdminPageEditor";
import PreparacaoNoteSection from "@/components/PreparacaoNoteSection";
import PreparacaoPageLayout from "@/components/PreparacaoPageLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminPageConfig } from "@/hooks/useAdminPageConfig";
import { CheckCircle2 } from "lucide-react";

const defaultConfig = {
  title: "Onboarding do Cliente",
  description: "Sequência coreografada da Semana 0 para causar o Efeito UAU no cliente.",
  principleTitle: "Princípio: o onboarding deve gerar Efeito UAU",
  principleText:
    "O onboarding ideal é coreografado como uma sequência com intenção. A comunicação deve sair do tom comercial e entrar no tom de operação logo no momento do fechamento.",
  timelineTitle: "Sequência da Semana 0",
  timeline: [
    {
      badge: "Fechamento",
      badgeClass: "bg-muted border-border/60",
      text: "Cliente recebe a confirmação oficial com linguagem de entrada em projeto, não de venda concluída. A comunicação sai do tom comercial e entra no tom de operação.",
    },
    {
      badge: "0 – 24h",
      badgeClass: "bg-muted border-border/60",
      text: 'Kit simbólico + acesso digital. Carta de boas-vindas personalizada Wayzen + "Cartão de Acesso VIP" dourado com QR Code para a comunidade exclusiva de donos de escola + link para o portal do projeto.',
    },
    {
      badge: "24 – 48h",
      badgeClass: "bg-muted border-border/60",
      text: "Reunião de alinhamento executivo: contrato explicado, regras do jogo, forma de apuração, acessos, responsabilidades, limites de escopo e cronograma dos 4 sprints.",
    },
    {
      badge: "48 – 72h",
      badgeClass: "bg-muted border-border/60",
      text: "Equipe do cliente entra no portal. Grupo do projeto ativado (WhatsApp/Slack), responsáveis inseridos, kickoff interno agendado, coleta de dados iniciada.",
    },
    {
      badge: "Fim da semana 1",
      badgeClass: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      text: "Cliente já enxerga materialidade: mapa da operação atual, primeiros gargalos visíveis, cronograma vivo, playbook em construção, funil desenhado, campos de registro definidos.",
    },
  ],
  kitTitle: "Itens do kit simbólico",
  kitItems: [
    "Envelopes personalizados com identidade visual Wayzen",
    "Carta de boas-vindas assinada pelos sócios",
    'Cartão dourado "Acesso VIP" com QR Code para a comunidade exclusiva (donos de escola)',
    "QR Code com link ao portal do projeto para inserção dos coordenadores",
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

export default function PreparacaoOnboarding() {
  const { config, isAdmin } = useAdminPageConfig("preparacao.onboarding", defaultConfig);

  return (
    <PreparacaoPageLayout
      title={config.title}
      description={config.description}
      actions={isAdmin ? <AdminPageEditor pageKey="preparacao.onboarding" defaults={defaultConfig} /> : null}
    >
      <SectionCard title={config.principleTitle}>
        <p>{config.principleText}</p>
      </SectionCard>

      <SectionCard title={config.timelineTitle}>
        <div className="space-y-4">
          {config.timeline.map(({ badge, badgeClass, text }) => (
            <div key={badge} className="flex gap-3">
              <Badge className={`${badgeClass} border shrink-0 font-mono`}>{badge}</Badge>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title={config.kitTitle}>
        <ul className="space-y-1.5">
          {config.kitItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      <PreparacaoNoteSection section="onboarding" />
    </PreparacaoPageLayout>
  );
}
