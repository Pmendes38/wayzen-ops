import AdminPageEditor from "@/components/AdminPageEditor";
import PreparacaoNoteSection from "@/components/PreparacaoNoteSection";
import PreparacaoPageLayout from "@/components/PreparacaoPageLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminPageConfig } from "@/hooks/useAdminPageConfig";
import { cn } from "@/lib/utils";
import { ChevronRight, CircleCheckBig } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type PanelId = string;

const defaultConfig = {
  title: "ICP Geral Unificado",
  description: "Documento estratégico do cliente ideal da Wayzen com navegação, qualificação e scripts.",
  navItems: [
    { id: "resumo", icon: "📋", label: "ICP Geral" },
    { id: "segmentos", icon: "🗂", label: "Segmentos" },
    { id: "qualificacao", icon: "✅", label: "Qualificação" },
    { id: "abordagem", icon: "💬", label: "Abordagem" },
    { id: "forade", icon: "🚫", label: "Fora do ICP" },
  ],
  summary: {
    heading: "Cliente Ideal da Wayzen",
    subheading: "Definição unificada — escolas, idiomas, cursos livres, creches e professores",
    heroTitle: "🎯 Quem é o cliente ideal da Wayzen",
    heroText:
      "Negócio educacional privado que depende de converter leads em alunos para crescer, tem receita recorrente por mensalidade, e não possui processo comercial estruturado — o dono atende, improvisa no WhatsApp e perde alunos por falta de follow-up.",
    universalCriteriaTitle: "Os 3 critérios universais do ICP",
    universalCriteria: [
      {
        icon: "1️⃣",
        title: "Recebe leads ativamente",
        text: "alunos ou responsáveis entram em contato por WhatsApp, Instagram, telefone ou site para saber sobre vagas ou matrículas.",
      },
      {
        icon: "2️⃣",
        title: "Depende de conversão",
        text: "o negócio cresce quando mais leads viram alunos. Turma vazia = prejuízo. Há sazonalidade, mas o funil nunca para.",
      },
      {
        icon: "3️⃣",
        title: "Tem ticket recorrente viável",
        text: "faturamento mínimo de R$50k/mês para viabilizar LOA. O crescimento marginal precisa gerar participação real para a Wayzen.",
      },
    ],
    plansTitle: "Faturamento mínimo por modelo Wayzen",
    plans: [
      {
        label: "Plano Padrão · R$1–1,8k + 15% LOA",
        value: "R$ 100k+",
        sub: "Faturamento mínimo recomendado",
        className: "border-l-2 border-l-emerald-400",
      },
      {
        label: "Plano Entrada · R$500–800 fixo",
        value: "R$ 50k+",
        sub: "Para segmentos menores",
        className: "border-l-2 border-l-blue-400",
      },
      {
        label: "Plano Agressivo · R$1,8–2,5k + 10%",
        value: "R$ 250k+",
        sub: "Alta escala e urgência",
        className: "border-l-2 border-l-amber-400",
      },
    ],
    priorityMapTitle: "Mapa de segmentos por prioridade",
    priorityMap: [
      { label: "🏫 Escolas privadas 201–500 matrículas (EF + EM)", badge: "Prioridade 1", color: "emerald" },
      { label: "🌎 Escolas de idiomas independentes", badge: "Prioridade 1", color: "emerald" },
      { label: "📚 Cursos livres com 50+ alunos", badge: "Prioridade 1", color: "emerald" },
      { label: "🏫 Escolas privadas 501–1000 matrículas", badge: "Prioridade 2", color: "blue" },
      { label: "🍼 Creches com EF ou 60+ crianças", badge: "Prioridade 2", color: "blue" },
      { label: "🎓 Polos EaD com gestão local", badge: "Prioridade 2", color: "blue" },
      { label: "👨‍🏫 Prof. independentes / centros de reforço", badge: "Plano entrada", color: "amber" },
      { label: "🏫 Escolas 51–200 matrículas só EI", badge: "Verificar", color: "zinc" },
    ],
    regionMetricsTitle: "Total de leads mapeados na região",
    regionMetrics: [
      { label: "Censo escolar (escolas privadas)", value: "107", sub: "4 municípios", className: "" },
      { label: "Prioridade 1 e 2 identificados", value: "38", sub: "Prontos para prospectar", className: "text-emerald-400" },
      { label: "Potencial adicional (idiomas, cursos)", value: "+30–50", sub: "Busca ativa Google/Instagram", className: "text-blue-400" },
    ],
  },
  segmentsPanel: {
    heading: "Segmentos",
    subheading: "Clique em cada segmento para ver ticket, LOA e critérios",
    items: [
      {
        id: "seg0",
        icon: "🏫",
        name: "Escolas privadas de Educação Básica",
        sub: "EF + EM · 201–1000 matrículas · R$150k–750k/mês",
        badge: "ICP Principal",
        badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        ticketLabel: "Ticket por aluno",
        ticketValue: "R$ 600–1.200/mês",
        loaLabel: "LOA estimado Wayzen",
        loaValue: "R$ 3k–12k/mês",
        loaClass: "text-emerald-400",
        bullets: [
          { icon: "✅", text: "Período intenso de matrículas (jan, fev, jul) com centenas de leads simultâneos" },
          { icon: "✅", text: "Dono ou secretária atende sem processo — alta taxa de leads perdidos" },
          { icon: "✅", text: "Sem CRM, sem follow-up, sem script definido" },
          { icon: "✅", text: "25 leads P1 já identificados no censo; 13 adicionais P2" },
          { icon: "⚠", text: "Escolas só com Ed. Infantil e porte até 50: faturamento insuficiente" },
        ],
      },
      {
        id: "seg1",
        icon: "🌎",
        name: "Escolas de idiomas independentes",
        sub: "Inglês, espanhol · 80–300 alunos · R$40k–200k/mês",
        badge: "ICP Principal",
        badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        ticketLabel: "Ticket por aluno",
        ticketValue: "R$ 250–700/mês",
        loaLabel: "LOA estimado Wayzen",
        loaValue: "R$ 1,5k–6k/mês",
        loaClass: "text-emerald-400",
        bullets: [
          { icon: "✅", text: "Captação permanente — sempre tem novo ciclo iniciando" },
          { icon: "✅", text: "Alta churn: alunos desistem por falta de acompanhamento" },
          { icon: "✅", text: "Decisão emocional — quem responde primeiro fecha mais" },
          { icon: "✅", text: "Butterfly Garden (Novo Gama) já identificada no censo · (61) 96476398" },
          { icon: "⚠", text: "Franquias (Wizard, CNA) têm processo central — focar nos independentes" },
        ],
      },
      {
        id: "seg2",
        icon: "📚",
        name: "Escolas de cursos livres",
        sub: "Informática, reforço, artes, profissionalizantes · R$30k–120k/mês",
        badge: "ICP Principal",
        badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        ticketLabel: "Ticket por aluno",
        ticketValue: "R$ 150–400/mês",
        loaLabel: "LOA estimado Wayzen",
        loaValue: "R$ 1k–4k/mês",
        loaClass: "text-emerald-400",
        bullets: [
          { icon: "✅", text: "Turma vazia = prejuízo imediato — urgência real para converter leads" },
          { icon: "✅", text: "Dono é o professor: sem ninguém para atender o lead durante a aula" },
          { icon: "✅", text: "Ciclo de decisão curto (3–7 dias) — velocidade de resposta é decisiva" },
          { icon: "🔍", text: "Não mapeados no censo — busca via Google Maps e Instagram" },
        ],
      },
      {
        id: "seg3",
        icon: "🍼",
        name: "Creches privadas com EF ou 60+ crianças",
        sub: "Ed. Infantil + EF1 · R$50k–150k/mês",
        badge: "Prioridade 2",
        badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        ticketLabel: "Ticket por criança",
        ticketValue: "R$ 800–1.400/mês",
        loaLabel: "LOA estimado Wayzen",
        loaValue: "R$ 1k–3,5k/mês",
        loaClass: "text-blue-400",
        bullets: [
          { icon: "✅", text: "Lista de espera longa — leads chegam mas não são convertidos estruturadamente" },
          { icon: "✅", text: "Alta fidelização (criança fica anos) — LTV altíssimo para quem entra" },
          { icon: "✅", text: "Melhor abordagem: creches com Pré-escola (4–5 anos) ou EF1" },
          { icon: "⚠", text: "Só berçário (0–2 anos) = captação quase 100% indicação, sem funil" },
        ],
      },
      {
        id: "seg4",
        icon: "🎓",
        name: "Polos EaD com gestão local",
        sub: "Anhanguera, Unopar, Estácio · R$100k–500k/mês",
        badge: "Prioridade 2",
        badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        ticketLabel: "Ticket por aluno",
        ticketValue: "R$ 200–600/mês",
        loaLabel: "LOA estimado Wayzen",
        loaValue: "R$ 3k–10k/mês",
        loaClass: "text-blue-400",
        bullets: [
          { icon: "✅", text: "Gestor local bate meta de novas matrículas a cada semestre" },
          { icon: "✅", text: "200–1.500 alunos matriculados por polo — alto volume e ticket recorrente" },
          { icon: "✅", text: "Central da franquia não cobre atendimento e captação regional" },
          { icon: "🔍", text: "Buscar no e-MEC → Polo EaD por município (consulta diferente de IES)" },
        ],
      },
      {
        id: "seg5",
        icon: "👨‍🏫",
        name: "Professores independentes / centros de reforço",
        sub: "Reforço, preparatório, aula particular com equipe · R$15k–80k/mês",
        badge: "Plano entrada",
        badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
        ticketLabel: "Ticket por aluno",
        ticketValue: "R$ 200–600/mês",
        loaLabel: "Produto ideal",
        loaValue: "Sprint único fixo · sem LOA",
        loaClass: "text-amber-400",
        bullets: [
          { icon: "✅", text: "Centro de reforço com 3+ professores e 50+ alunos — já é uma micro-escola" },
          { icon: "✅", text: "Professor-dono virou gestor: recebe leads, cobra mensalidade, processo fraco" },
          { icon: "⚠", text: "Professor solo (8–15 alunos): faturamento insuficiente — não abordar" },
          { icon: "💡", text: "Estratégia: produto entrada → crescem → viram clientes do plano padrão" },
        ],
      },
    ],
  },
  qualification: {
    heading: "Qualificação",
    subheading: "Critérios universais para todos os segmentos",
    questionsTitle: "As 5 perguntas no primeiro contato",
    questions: [
      {
        question: "Vocês recebem pedidos de vaga por WhatsApp ou Instagram?",
        explanation: "Se sim, existe funil. Se não, não há onde operar.",
      },
      {
        question: "Quando um interessado manda mensagem, quanto tempo leva até responder?",
        explanation: "Acima de 30 min = dor real.",
      },
      {
        question: "Quantos alunos vocês fecharam no último mês?",
        explanation: "Cruza com o volume de leads. Quanto mais baixo, mais urgente.",
      },
      {
        question: "Tem alguém dedicado a fazer follow-up com quem pediu info e não voltou?",
        explanation: "Resposta “não” = qualificado. Sempre.",
      },
      {
        question: "Qual é a mensalidade média de um aluno?",
        explanation: "Valida se o ticket suporta o modelo LOA.",
      },
    ],
    scoreTitle: "Score de qualificação interativo",
    scoreItems: [
      { label: "Recebe leads por WhatsApp ou Instagram", pts: 20 },
      { label: "Faturamento estimado acima de R$80k/mês", pts: 20 },
      { label: "Não tem processo de follow-up", pts: 15 },
      { label: "Dono/gestor atende os leads diretamente", pts: 15 },
      { label: "Ticket por aluno acima de R$400/mês", pts: 15 },
      { label: "Mais de 50 alunos/clientes ativos", pts: 10 },
      { label: "Sem CRM ou sistema de atendimento", pts: 5 },
    ],
    scoreLabels: [
      { min: 0, max: 30, label: "Fora do ICP por enquanto", className: "text-red-400" },
      { min: 31, max: 60, label: "Qualificar melhor antes de avançar", className: "text-amber-400" },
      { min: 61, max: 85, label: "Agendar diagnóstico", className: "text-blue-400" },
      { min: 86, max: 100, label: "Lead quente — priorizar hoje", className: "text-emerald-400" },
    ],
    decisionTableTitle: "Tabela de decisão rápida",
    decisionTable: [
      { label: "Escola 201–500 mat. com EF+EM", badge: "Fechar diagnóstico", color: "emerald" },
      { label: "Escola idiomas independente 80+ alunos", badge: "Fechar diagnóstico", color: "emerald" },
      { label: "Curso livre 50+ alunos", badge: "Fechar diagnóstico", color: "emerald" },
      { label: "Creche 60+ crianças + EF ou Pré", badge: "Qualificar e agendar", color: "blue" },
      { label: "Polo EaD com gestor local", badge: "Qualificar e agendar", color: "blue" },
      { label: "Centro de reforço 3+ professores", badge: "Plano entrada / nutrir", color: "amber" },
      { label: "Professor solo <15 alunos", badge: "Não abordar agora", color: "red" },
      { label: "Escola só EI até 50 matrículas", badge: "Não abordar agora", color: "red" },
      { label: "Franquia com processo central", badge: "Fora do ICP", color: "red" },
    ],
  },
  approach: {
    heading: "Scripts de Abordagem",
    subheading: "Abertura por segmento + objeções universais",
    openingLabel: "Abertura",
    scripts: [
      {
        title: "Escola privada",
        text: "Oi [nome], tudo bem? Aqui é [nome], da Wayzen. A gente trabalha com escolas da região ajudando a estruturar o processo de matrículas — do lead ao aluno fechado. Queria entender como vocês estão lidando com os contatos de interessados agora: tem alguém dedicado a esse atendimento ou é você mesmo que responde?",
      },
      {
        title: "Escola de idiomas",
        text: "Oi [nome]! Da Wayzen aqui. Trabalhamos com escolas de idiomas na região. Quando um aluno manda mensagem perguntando sobre inglês e vocês estão em aula — em quanto tempo costuma ter resposta? Pergunto porque essa janela é exatamente onde a maioria das escolas perde matrícula para o concorrente.",
      },
      {
        title: "Curso livre / reforço",
        text: "Oi [nome], da Wayzen. A gente estrutura processo de captação para centros de curso aqui da região. Uma pergunta direta: quando você está dando aula e chega um interessado no WhatsApp — quem atende? Essa é a principal causa de perda de alunos que vemos em todo curso que conversa com a gente.",
      },
      {
        title: "Creche privada",
        text: "Oi [nome], da Wayzen. A gente trabalha com creches e escolas da região ajudando a transformar interessados em lista de espera em matrículas fechadas. Vocês costumam ter muitos pais que pedem vaga e não voltam mais? Esse é exatamente o ponto onde a gente entra.",
      },
    ],
    objectionsTitle: "Objeções universais",
    objections: [
      {
        question: "Já tenho alunos, não preciso de mais captação",
        answer:
          "Faz sentido quando tá cheio. A pergunta é: se hoje você perder 10 alunos por desistência — o que acontece com a receita? A gente não trabalha só captação. Também estrutura retenção e o processo que evita essa perda.",
      },
      {
        question: "Quanto custa?",
        answer:
          "A gente trabalha com taxa fixa pequena mais participação no resultado gerado. Se a escola não crescer, a Wayzen não cobra LOA. O investimento cresce junto com o seu faturamento — não é custo fixo alto.",
      },
      {
        question: "Já tentei agência de marketing e não funcionou",
        answer:
          "Agência entrega lead. A gente entra depois — no atendimento, no follow-up, no fechamento. O problema da maioria não é falta de lead. É que o lead chega e ninguém converte. É esse processo que a gente instala.",
      },
    ],
  },
  outside: {
    heading: "Fora do ICP",
    subheading: "Perfis eliminatórios e em quarentena",
    eliminationTitle: "❌ Critérios eliminatórios — não prospectar",
    eliminationText: "Se qualquer um desses critérios for verdadeiro, o lead deve ser descartado na qualificação.",
    eliminationItems: [
      { icon: "🚫", title: "Faturamento abaixo de R$30k/mês", text: "o lucro adicional gerado seria insuficiente para viabilizar LOA." },
      { icon: "🚫", title: "Escola ou creche comunitária / filantrópica", text: "sem fins lucrativos, sem capacidade de investimento." },
      { icon: "🚫", title: "Só berçário (0–2 anos)", text: "captação 100% por indicação orgânica, não há funil ativo." },
      { icon: "🚫", title: "Franquias com processo comercial centralizado", text: "Wizard, CNA, CCAA, Kumon. Decisão é da rede, não do franqueado local." },
      { icon: "🚫", title: "Professor solo com menos de 15 alunos", text: "faturamento máximo ~R$8k, sem margem para qualquer modelo." },
      { icon: "🚫", title: "IES sem sede local e sem polo ativo", text: "nenhuma faculdade com sede nos 4 municípios identificada no e-MEC." },
      { icon: "🚫", title: "Escolas públicas", text: "sem processo comercial, sem matrícula livre, sem capacidade de contratar." },
    ],
    quarantineTitle: "Em quarentena — validar antes de abordar",
    quarantineItems: [
      { icon: "⏸", title: "Escolas 51–200 matrículas só com EI", text: "abordar apenas se confirmar plano de expansão para EF." },
      { icon: "⏸", title: "Escolas sem telefone no censo", text: "13 escolas. Buscar via Google Maps antes de incluir na prospecção ativa." },
      { icon: "⏸", title: "Polos EaD não confirmados", text: "buscar especificamente “polo EaD” no e-MEC antes de prospectar." },
      { icon: "⏸", title: "Professores com até 2 profissionais", text: "nutrir com conteúdo até atingir porte mínimo." },
    ],
    futureTitle: "Expansão futura — fora de educação",
    futureItems: [
      { title: "🏥 Clínicas e consultórios", text: "Alta dependência de conversão de leads (consultas)" },
      { title: "🏋 Academias e studios", text: "Matrícula mensal, churn alto, processo fraco" },
      { title: "🏢 Franquias locais independentes", text: "Franqueados com autonomia de captação" },
      { title: "⚙ Serviços recorrentes B2B", text: "Segurança, limpeza, manutenção" },
    ],
  },
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground first:mt-0">{children}</p>;
}

function MetricCard({ label, value, sub, className }: { label: string; value: string; sub: string; className?: string }) {
  return (
    <Card className={cn("border-border/60 bg-background/40", className)}>
      <CardContent className="p-4">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

function badgeClassForColor(color: string) {
  return cn(
    "border",
    color === "emerald" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    color === "blue" && "border-blue-500/30 bg-blue-500/10 text-blue-400",
    color === "amber" && "border-amber-500/30 bg-amber-500/10 text-amber-400",
    color === "red" && "border-red-500/30 bg-red-500/10 text-red-400",
    color === "zinc" && "border-border/60 bg-muted/30 text-muted-foreground"
  );
}

function splitValue(value: string) {
  const parts = value.split("/");
  return {
    main: parts[0],
    suffix: parts.length > 1 ? parts.slice(1).join("/") : null,
  };
}

export default function PreparacaoICP() {
  const { config, isAdmin } = useAdminPageConfig("preparacao.icp", defaultConfig);
  const [activePanel, setActivePanel] = useState<PanelId>(defaultConfig.navItems[0].id);
  const [openSegment, setOpenSegment] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const stored = localStorage.getItem("wayzen-icp-score-checks");
    if (stored) {
      setChecks(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("wayzen-icp-score-checks", JSON.stringify(checks));
  }, [checks]);

  useEffect(() => {
    if (!config.navItems.some((item) => item.id === activePanel)) {
      setActivePanel(config.navItems[0]?.id ?? "resumo");
    }
  }, [activePanel, config.navItems]);

  const score = config.qualification.scoreItems.reduce((sum, item, index) => sum + (checks[index] ? item.pts : 0), 0);
  const scoreStatus = config.qualification.scoreLabels.find((item) => score >= item.min && score <= item.max) ?? config.qualification.scoreLabels[0];

  return (
    <PreparacaoPageLayout
      title={config.title}
      description={config.description}
      actions={isAdmin ? <AdminPageEditor pageKey="preparacao.icp" defaults={defaultConfig} /> : null}
    >
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-border/60 bg-card/60 p-3 backdrop-blur">
            <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Navegação</p>
            <div className="space-y-1">
              {config.navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActivePanel(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-left text-sm transition-colors",
                    activePanel === item.id
                      ? "border-fuchsia-500/30 bg-fuchsia-500/10 text-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  )}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto lg:hidden">
            {config.navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePanel(item.id)}
                className={cn(
                  "whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  activePanel === item.id
                    ? "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300"
                    : "border-border/60 text-muted-foreground"
                )}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>

          {activePanel === "resumo" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{config.summary.heading}</h2>
                <p className="text-sm text-muted-foreground">{config.summary.subheading}</p>
              </div>

              <Card className="border-emerald-500/25 bg-emerald-500/5">
                <CardContent className="p-5">
                  <p className="mb-2 text-sm font-bold text-emerald-400">{config.summary.heroTitle}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{config.summary.heroText}</p>
                </CardContent>
              </Card>

              <SectionTitle>{config.summary.universalCriteriaTitle}</SectionTitle>
              <Card className="border-border/60">
                <CardContent className="space-y-3 p-5 text-sm text-muted-foreground">
                  {config.summary.universalCriteria.map((item) => (
                    <div key={item.title} className="flex gap-3">
                      <span>{item.icon}</span>
                      <p>
                        <strong className="text-foreground">{item.title}</strong> — {item.text}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <SectionTitle>{config.summary.plansTitle}</SectionTitle>
              <div className="grid gap-3 md:grid-cols-3">
                {config.summary.plans.map((plan) => (
                  <MetricCard key={plan.label} label={plan.label} value={plan.value} sub={plan.sub} className={plan.className} />
                ))}
              </div>

              <SectionTitle>{config.summary.priorityMapTitle}</SectionTitle>
              <Card className="border-border/60">
                <CardContent className="p-0">
                  {config.summary.priorityMap.map((item, index) => (
                    <div key={item.label} className={cn("flex items-center justify-between gap-3 px-5 py-3 text-sm", index < config.summary.priorityMap.length - 1 && "border-b border-border/60")}>
                      <span className="text-muted-foreground">{item.label}</span>
                      <Badge className={badgeClassForColor(item.color)}>{item.badge}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <SectionTitle>{config.summary.regionMetricsTitle}</SectionTitle>
              <div className="grid gap-3 md:grid-cols-3">
                {config.summary.regionMetrics.map((metric) => (
                  <MetricCard key={metric.label} label={metric.label} value={metric.value} sub={metric.sub} className={metric.className} />
                ))}
              </div>
            </div>
          )}

          {activePanel === "segmentos" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{config.segmentsPanel.heading}</h2>
                <p className="text-sm text-muted-foreground">{config.segmentsPanel.subheading}</p>
              </div>
              {config.segmentsPanel.items.map((segment) => {
                const isOpen = openSegment === segment.id;
                const ticket = splitValue(segment.ticketValue);
                const loa = splitValue(segment.loaValue);
                return (
                  <Card
                    key={segment.id}
                    className={cn(
                      "cursor-pointer border-border/60 bg-card/60 transition-colors hover:bg-accent/30",
                      isOpen && "border-fuchsia-500/30"
                    )}
                    onClick={() => setOpenSegment(isOpen ? null : segment.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/40 text-xl">{segment.icon}</div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground">{segment.name}</p>
                          <p className="text-xs text-muted-foreground">{segment.sub}</p>
                        </div>
                        <Badge className={cn("border", segment.badgeClass)}>{segment.badge}</Badge>
                        <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-90")} />
                      </div>
                      {isOpen && (
                        <div className="mt-4 space-y-4 border-t border-border/60 pt-4">
                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{segment.ticketLabel}</p>
                              <p className="text-2xl font-bold tracking-tight">{ticket.main}{ticket.suffix ? <span className="text-sm text-muted-foreground">/{ticket.suffix}</span> : null}</p>
                            </div>
                            <div>
                              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{segment.loaLabel}</p>
                              <p className={cn("text-2xl font-bold tracking-tight", segment.loaClass)}>{loa.main}{loa.suffix ? <span className="text-sm text-muted-foreground">/{loa.suffix}</span> : null}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {segment.bullets.map((bullet) => (
                              <div key={bullet.text} className="flex gap-3 text-sm text-muted-foreground">
                                <span>{bullet.icon}</span>
                                <p>{bullet.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {activePanel === "qualificacao" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{config.qualification.heading}</h2>
                <p className="text-sm text-muted-foreground">{config.qualification.subheading}</p>
              </div>

              <SectionTitle>{config.qualification.questionsTitle}</SectionTitle>
              <Card className="border-border/60">
                <CardContent className="space-y-3 p-5 text-sm text-muted-foreground">
                  {config.qualification.questions.map((item, index) => (
                    <div key={item.question} className="flex gap-3">
                      <span className="font-mono font-bold text-emerald-400">0{index + 1}</span>
                      <p>
                        <strong className="text-foreground">{item.question}</strong> — {item.explanation}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <SectionTitle>{config.qualification.scoreTitle}</SectionTitle>
              <Card className="border-border/60">
                <CardContent className="p-5">
                  <div className="mb-4 flex items-center gap-4 rounded-xl border border-border/60 bg-background/40 p-4">
                    <div className={cn("font-mono text-5xl font-extrabold tracking-tight", scoreStatus.className)}>{score}</div>
                    <div>
                      <p className="text-xs text-muted-foreground">Score de qualificação</p>
                      <p className={cn("text-sm font-semibold", scoreStatus.className)}>{scoreStatus.label}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {config.qualification.scoreItems.map((item, index) => (
                      <button
                        key={item.label}
                        onClick={() => setChecks((prev) => ({ ...prev, [index]: !prev[index] }))}
                        className="flex w-full items-center gap-3 rounded-md border-b border-border/60 px-1 py-3 text-left last:border-b-0 hover:bg-accent/30"
                      >
                        <div className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-md border",
                          checks[index]
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : "border-border/60 bg-muted/30 text-transparent"
                        )}>
                          <CircleCheckBig className="h-3.5 w-3.5" />
                        </div>
                        <span className="flex-1 text-sm text-muted-foreground">{item.label}</span>
                        <span className="font-mono text-xs text-muted-foreground">+{item.pts}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <SectionTitle>{config.qualification.decisionTableTitle}</SectionTitle>
              <Card className="border-border/60">
                <CardContent className="p-0">
                  {config.qualification.decisionTable.map((item, index) => (
                    <div key={item.label} className={cn("flex items-center justify-between gap-3 px-5 py-3 text-sm", index < config.qualification.decisionTable.length - 1 && "border-b border-border/60")}>
                      <span className="text-muted-foreground">{item.label}</span>
                      <Badge className={badgeClassForColor(item.color)}>{item.badge}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {activePanel === "abordagem" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{config.approach.heading}</h2>
                <p className="text-sm text-muted-foreground">{config.approach.subheading}</p>
              </div>
              {config.approach.scripts.map((script) => (
                <div key={script.title}>
                  <SectionTitle>{script.title}</SectionTitle>
                  <Card className="border-border/60">
                    <CardContent className="p-5">
                      <div className="rounded-xl border border-border/60 bg-background/40 p-4 italic text-sm leading-7 text-foreground">
                        <p className="mb-2 not-italic text-[10px] font-semibold uppercase tracking-[0.16em] text-fuchsia-300">{config.approach.openingLabel}</p>
                        {script.text}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}

              <SectionTitle>{config.approach.objectionsTitle}</SectionTitle>
              <Card className="border-border/60">
                <CardContent className="space-y-3 p-5">
                  {config.approach.objections.map((objection) => (
                    <div key={objection.question} className="rounded-r-lg border-l-2 border-border/60 bg-background/40 p-4">
                      <p className="mb-1 text-sm italic text-muted-foreground">“{objection.question}”</p>
                      <p className="text-sm leading-6 text-foreground">{objection.answer}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {activePanel === "forade" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{config.outside.heading}</h2>
                <p className="text-sm text-muted-foreground">{config.outside.subheading}</p>
              </div>
              <Card className="border-red-500/25 bg-red-500/5">
                <CardContent className="p-5">
                  <p className="mb-2 text-sm font-bold text-red-400">{config.outside.eliminationTitle}</p>
                  <p className="text-sm text-muted-foreground">{config.outside.eliminationText}</p>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardContent className="space-y-3 p-5 text-sm text-muted-foreground">
                  {config.outside.eliminationItems.map((item) => (
                    <div key={item.title} className="flex gap-3">
                      <span>{item.icon}</span>
                      <p>
                        <strong className="text-foreground">{item.title}</strong> — {item.text}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <SectionTitle>{config.outside.quarantineTitle}</SectionTitle>
              <Card className="border-border/60">
                <CardContent className="space-y-3 p-5 text-sm text-muted-foreground">
                  {config.outside.quarantineItems.map((item) => (
                    <div key={item.title} className="flex gap-3">
                      <span>{item.icon}</span>
                      <p>
                        <strong className="text-foreground">{item.title}</strong> — {item.text}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <SectionTitle>{config.outside.futureTitle}</SectionTitle>
              <div className="grid gap-3 md:grid-cols-2">
                {config.outside.futureItems.map((item) => (
                  <Card key={item.title} className="border-border/60 bg-background/40">
                    <CardContent className="p-4">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <PreparacaoNoteSection section="icp" />
        </div>
      </div>
    </PreparacaoPageLayout>
  );
}