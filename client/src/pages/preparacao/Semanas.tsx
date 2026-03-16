import AdminPageEditor from "@/components/AdminPageEditor";
import PreparacaoNoteSection from "@/components/PreparacaoNoteSection";
import PreparacaoPageLayout from "@/components/PreparacaoPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminPageConfig } from "@/hooks/useAdminPageConfig";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const defaultConfig = {
  title: "Cronograma de Lançamento",
  description: "1 de abril → 15 de maio de 2026 · 6 semanas",
  people: {
    P: { bg: "#BF00FF", label: "P", name: "Pedro", role: "Gestor Geral" },
    M: { bg: "#1D9E75", label: "M", name: "Matheus", role: "Comercial" },
    D: { bg: "#D85A30", label: "D", name: "Danielle", role: "Marketing & Operação" },
  },
  filters: [
    { id: "all", label: "Todas" },
    { id: "P", label: "Pedro" },
    { id: "M", label: "Matheus" },
    { id: "D", label: "Danielle" },
    { id: "PM", label: "Pedro + Matheus" },
    { id: "PD", label: "Pedro + Danielle" },
  ],
  tagLabels: {
    design: "Design",
    digital: "Digital",
    comercial: "Comercial",
    conteudo: "Conteúdo",
    fisico: "Material físico",
    marketing: "Marketing",
  },
  phases: [
    {
      id: "p1",
      color: "#BF00FF",
      title: "Fase 1 — Fundação digital e estrutura",
      weeks: [
        {
          label: "Semana 1 · 1–7 abr",
          tasks: [
            { name: "Registrar domínio e contratar hospedagem", tag: "digital", resp: ["P"] },
            { name: "Criar e-mails profissionais (pedro@, danielle@, matheus@)", tag: "digital", resp: ["P"] },
            { name: "Abrir conta e configurar o CRM Kommo (funil, etapas, campos)", tag: "digital", resp: ["P", "M"] },
            { name: "Contratar plataforma \"Empresa Aqui\" para prospecção", tag: "digital", resp: ["P"] },
            { name: "Criar perfis no Instagram, LinkedIn e WhatsApp Business", tag: "digital", resp: ["D"] },
            { name: "Definir bio, links e identidade visual nos perfis sociais", tag: "design", resp: ["D"] },
            { name: "Montar pasta compartilhada de gestão do projeto (Google Drive/Notion)", tag: "digital", resp: ["P"] },
          ],
        },
        {
          label: "Semana 2 · 8–14 abr",
          tasks: [
            { name: "Criar apresentação institucional da Wayzen (quem somos, método ERO's)", tag: "design", resp: ["P", "D"] },
            { name: "Montar template de proposta comercial personalizada", tag: "comercial", resp: ["P"] },
            { name: "Criar script de prospecção (abordagem inicial — primeiro contato)", tag: "comercial", resp: ["P", "M"] },
            { name: "Mapear lista de 50 escolas-alvo (ICP) com contatos e decisores", tag: "comercial", resp: ["P", "M"] },
            { name: "Criar script de qualificação e diagnóstico ao vivo (roteiro 90 min)", tag: "comercial", resp: ["P", "M"] },
            { name: "Criar matriz de objeções com respostas padrão", tag: "comercial", resp: ["P", "M"] },
          ],
        },
      ],
    },
    {
      id: "p2",
      color: "#D85A30",
      title: "Fase 2 — Ensaio fotográfico e identidade visual",
      weeks: [
        {
          label: "Semana 2–3 · 8–18 abr",
          tasks: [
            { name: "Realizar ensaio fotográfico profissional (individual, trio, ambiente de trabalho)", tag: "fisico", resp: ["P", "M", "D"] },
            { name: "Selecionar e editar fotos do ensaio com o fotógrafo", tag: "design", resp: ["D"] },
            { name: "Criar templates de posts para o feed do Instagram", tag: "design", resp: ["D"] },
            { name: "Criar templates para Stories e Reels", tag: "design", resp: ["D"] },
            { name: "Criar 3 criativos de anúncio (dor, solução, prova social)", tag: "design", resp: ["D", "P"] },
            { name: "Encomendar camisetas, crachás e broches da marca", tag: "fisico", resp: ["P"] },
            { name: "Encomendar cartões de visita (os três)", tag: "fisico", resp: ["P"] },
            { name: "Encomendar folders de apresentação", tag: "fisico", resp: ["P", "D"] },
          ],
        },
      ],
    },
    {
      id: "p3",
      color: "#EF9F27",
      title: "Fase 3 — Conteúdo e trilha de mentoria",
      weeks: [
        {
          label: "Semana 3–4 · 15–25 abr",
          tasks: [
            { name: "Definir pilares de conteúdo (motor de matrícula, balde furado, receita previsível)", tag: "conteudo", resp: ["D", "P"] },
            { name: "Criar calendário editorial para 30 dias (mínimo 3 posts/semana)", tag: "conteudo", resp: ["D"] },
            { name: "Produzir 8 posts de aquecimento para o feed (antes do lançamento oficial)", tag: "conteudo", resp: ["D"] },
            { name: "Gravar 2 Reels de autoridade (dor do gestor de escola)", tag: "conteudo", resp: ["D", "P"] },
            { name: "Estruturar a trilha de conteúdo da mentoria: módulos, sequência e materiais", tag: "conteudo", resp: ["D", "P"] },
            { name: "Configurar comunidade exclusiva para donos de escola (WhatsApp ou Circle)", tag: "digital", resp: ["D"] },
          ],
        },
      ],
    },
    {
      id: "p4",
      color: "#1D9E75",
      title: "Fase 4 — Kit onboarding e funil no CRM",
      weeks: [
        {
          label: "Semana 3–4 · 15–25 abr",
          tasks: [
            { name: "Finalizar carta de boas-vindas com identidade visual Wayzen", tag: "design", resp: ["D"] },
            { name: "Produzir cartão VIP dourado com QR Code de acesso à comunidade", tag: "fisico", resp: ["P", "D"] },
            { name: "Encomendar envelopes personalizados para o kit onboarding", tag: "fisico", resp: ["P"] },
            { name: "Montar kit completo (envelope + carta + cartão VIP + acesso digital)", tag: "fisico", resp: ["P", "D"] },
            { name: "Configurar portal do projeto no CRM com etapas dos 4 sprints", tag: "digital", resp: ["P", "M"] },
            { name: "Criar QR Code e link de acesso personalizado por cliente", tag: "digital", resp: ["P"] },
          ],
        },
        {
          label: "Semana 4 · 22–28 abr",
          tasks: [
            { name: "Configurar funil comercial completo no CRM (6 etapas)", tag: "digital", resp: ["P", "M"] },
            { name: "Definir KPIs e metas mínimas diárias e semanais para o time comercial", tag: "comercial", resp: ["P"] },
            { name: "Definir SLA de resposta e regras de follow-up obrigatório", tag: "comercial", resp: ["P", "M"] },
            { name: "Treinar o uso do CRM com Matheus (registro, follow-up, notas)", tag: "comercial", resp: ["P", "M"] },
          ],
        },
      ],
    },
    {
      id: "p5",
      color: "#185FA5",
      title: "Fase 5 — Prospecção ativa e marketing",
      weeks: [
        {
          label: "Semana 4–5 · 22 abr – 2 mai",
          tasks: [
            { name: "Publicar os 8 posts de aquecimento + 2 Reels de autoridade", tag: "conteudo", resp: ["D"] },
            { name: "Ativar tráfego pago inicial (R$ 1.250 — Meta/Instagram Ads)", tag: "marketing", resp: ["D", "P"] },
            { name: "Iniciar prospecção ativa via \"Empresa Aqui\" (50 contatos/semana)", tag: "comercial", resp: ["M", "P"] },
            { name: "Realizar primeiras reuniões de diagnóstico com leads qualificados", tag: "comercial", resp: ["P", "M"] },
            { name: "Registrar todos os contatos e movimentações no CRM diariamente", tag: "digital", resp: ["M"] },
            { name: "Aplicar testes A/B de abordagem e ajustar script com base nos retornos", tag: "comercial", resp: ["P", "M"] },
          ],
        },
        {
          label: "Semana 5–6 · 29 abr – 9 mai",
          tasks: [
            { name: "Manter ritmo de prospecção: 50+ contatos/semana com registro obrigatório", tag: "comercial", resp: ["M", "P"] },
            { name: "Fazer follow-up dos diagnósticos realizados e avançar propostas", tag: "comercial", resp: ["P", "M"] },
            { name: "Apresentar proposta ao menos para 3 escolas qualificadas", tag: "comercial", resp: ["P", "M"] },
            { name: "Publicar conteúdo seguindo o calendário editorial", tag: "conteudo", resp: ["D"] },
            { name: "Análise semanal de métricas: resposta, proposta e conversão", tag: "digital", resp: ["P"] },
          ],
        },
      ],
    },
    {
      id: "p6",
      color: "#BF00FF",
      title: "Fase 6 — Primeiro cliente e lançamento oficial",
      weeks: [
        {
          label: "Semana 6 · 5–15 mai",
          tasks: [
            { name: "Fechar primeiro contrato de cliente (meta: até 10 de maio)", tag: "comercial", resp: ["P", "M"] },
            { name: "Executar onboarding do primeiro cliente com \"Efeito UAU\" completo", tag: "comercial", resp: ["P", "M"] },
            { name: "Enviar kit físico (carta + cartão VIP + acesso digital) ao cliente", tag: "fisico", resp: ["P"] },
            { name: "Fazer post de lançamento oficial da Wayzen nas redes sociais", tag: "conteudo", resp: ["D", "P"] },
            { name: "Registrar aprendizados e atualizar script e funil com base nos dados", tag: "comercial", resp: ["P", "M"] },
            { name: "Montar cronograma e plano dos próximos 60 dias pós-lançamento", tag: "digital", resp: ["P"] },
          ],
        },
      ],
    },
  ],
  legalNote:
    "⚠ Fase Jurídica — Abertura de empresa, contrato social, registro de marca e contrato com clientes iniciam somente após o fechamento do primeiro cliente, conforme planejamento estratégico. Reservar R$ 10.700 – R$ 14.800 para esse momento.",
};

const TAG_CLASSES: Record<string, string> = {
  design: "bg-fuchsia-500/15 text-fuchsia-300",
  digital: "bg-sky-500/15 text-sky-300",
  comercial: "bg-teal-500/15 text-teal-300",
  conteudo: "bg-amber-500/15 text-amber-300",
  fisico: "bg-indigo-500/15 text-indigo-300",
  marketing: "bg-emerald-500/15 text-emerald-300",
};

function taskId(phaseIndex: number, weekIndex: number, taskIndex: number) {
  return `${phaseIndex}_${weekIndex}_${taskIndex}`;
}

export default function PreparacaoSemanas() {
  const { config, isAdmin } = useAdminPageConfig("preparacao.cronograma", defaultConfig);
  const [activeFilter, setActiveFilter] = useState("all");
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [openPhases, setOpenPhases] = useState<Record<string, boolean>>({ p1: true, p2: true });

  useEffect(() => {
    const stored = localStorage.getItem("wayzen-cronograma-checks");
    if (stored) setChecks(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("wayzen-cronograma-checks", JSON.stringify(checks));
  }, [checks]);

  useEffect(() => {
    if (activeFilter !== "all") {
      const opened = Object.fromEntries(config.phases.map((phase) => [phase.id, true]));
      setOpenPhases(opened);
    }
  }, [activeFilter, config.phases]);

  function matchesFilter(resp: readonly string[]) {
    if (activeFilter === "all") return true;
    if (activeFilter === "PM") return resp.includes("P") && resp.includes("M");
    if (activeFilter === "PD") return resp.includes("P") && resp.includes("D");
    return resp.includes(activeFilter);
  }

  const filteredData = useMemo(() => {
    return config.phases
      .map((phase, phaseIndex) => ({
        ...phase,
        phaseIndex,
        weeks: phase.weeks
          .map((week, weekIndex) => ({
            ...week,
            weekIndex,
            tasks: week.tasks
              .map((task, taskIndex) => ({ ...task, taskIndex }))
              .filter((task) => matchesFilter(task.resp)),
          }))
          .filter((week) => week.tasks.length > 0),
      }))
      .filter((phase) => phase.weeks.length > 0 || activeFilter === "all");
  }, [activeFilter, config.phases]);

  const progress = useMemo(() => {
    let total = 0;
    let done = 0;
    config.phases.forEach((phase, phaseIndex) => {
      phase.weeks.forEach((week, weekIndex) => {
        week.tasks.forEach((task, taskIndex) => {
          if (matchesFilter(task.resp)) {
            total += 1;
            if (checks[taskId(phaseIndex, weekIndex, taskIndex)]) done += 1;
          }
        });
      });
    });
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { total, done, pct };
  }, [checks, activeFilter, config.phases]);

  return (
    <PreparacaoPageLayout
      title={config.title}
      description={config.description}
      actions={isAdmin ? <AdminPageEditor pageKey="preparacao.cronograma" defaults={defaultConfig} /> : null}
    >
      <div className="space-y-6">
        <div>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-fuchsia-500 transition-all" style={{ width: `${progress.pct}%` }} />
            </div>
            <span className="min-w-10 text-right text-xs text-muted-foreground">{progress.pct}%</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          {Object.entries(config.people).map(([key, person]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white" style={{ backgroundColor: person.bg }}>
                {person.label}
              </div>
              <span>{person.name} — {person.role}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {config.filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs transition-colors",
                activeFilter === filter.id
                  ? "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300"
                  : "border-border/60 text-muted-foreground hover:bg-accent/40 hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredData.map((phase) => {
            let phaseTotal = 0;
            let phaseDone = 0;
            phase.weeks.forEach((week) => {
              week.tasks.forEach((task) => {
                phaseTotal += 1;
                if (checks[taskId(phase.phaseIndex, week.weekIndex, task.taskIndex)]) phaseDone += 1;
              });
            });
            const isOpen = !!openPhases[phase.id];
            return (
              <Card key={phase.id} className="overflow-hidden border-border/60">
                <button
                  onClick={() => setOpenPhases((prev) => ({ ...prev, [phase.id]: !prev[phase.id] }))}
                  className="flex w-full items-center gap-3 bg-card px-5 py-4 text-left hover:bg-accent/30"
                >
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: phase.color }} />
                  <span className="flex-1 text-sm font-semibold text-foreground">{phase.title}</span>
                  <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground">{phaseDone}/{phaseTotal}</span>
                  <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-90")} />
                </button>
                {isOpen && (
                  <CardContent className="space-y-4 border-t border-border/60 bg-background/30 p-5">
                    {phase.weeks.map((week) => (
                      <div key={week.label}>
                        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{week.label}</p>
                        <div className="space-y-2">
                          {week.tasks.map((task) => {
                            const id = taskId(phase.phaseIndex, week.weekIndex, task.taskIndex);
                            const isDone = !!checks[id];
                            return (
                              <div key={id} className="flex items-start gap-3 border-b border-border/60 py-2 last:border-b-0">
                                <input
                                  type="checkbox"
                                  checked={isDone}
                                  onChange={() => setChecks((prev) => ({ ...prev, [id]: !prev[id] }))}
                                  className="mt-1 h-4 w-4 accent-fuchsia-500"
                                />
                                <span className={cn("flex-1 text-sm leading-6 text-foreground", isDone && "text-muted-foreground line-through")}>{task.name}</span>
                                <div className="flex flex-wrap items-center justify-end gap-2">
                                  <span className={cn("rounded-md px-2 py-1 text-[10px] font-medium", TAG_CLASSES[task.tag] ?? "bg-muted/40 text-muted-foreground")}>
                                    {config.tagLabels[task.tag as keyof typeof config.tagLabels] ?? task.tag}
                                  </span>
                                  {task.resp.map((personId) => {
                                    const person = config.people[personId as keyof typeof config.people];
                                    if (!person) return null;
                                    return (
                                      <div
                                        key={`${id}-${personId}`}
                                        className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                                        style={{ backgroundColor: person.bg }}
                                        title={person.name}
                                      >
                                        {person.label}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        <div className="rounded-r-lg border-l-4 border-red-500 bg-red-500/5 p-4 text-sm text-muted-foreground">
          <strong className="text-red-400">⚠ Fase Jurídica</strong> — {config.legalNote.replace("⚠ Fase Jurídica — ", "")}
        </div>

        <PreparacaoNoteSection section="cronograma" />
      </div>
    </PreparacaoPageLayout>
  );
}