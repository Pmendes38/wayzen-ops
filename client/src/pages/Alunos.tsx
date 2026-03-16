import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { GraduationCap, Plus, User2, Mail, Phone, Building2, ArrowRight } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

// The 6-stage Alunos pipeline as defined in the Wayzen methodology
const STAGES = [
  { key: "novo_contato",      label: "Novo Contato",      color: "#6366f1" },
  { key: "qualificado",       label: "Qualificado",       color: "#8b5cf6" },
  { key: "proposta_enviada",  label: "Proposta Enviada",  color: "#BF00FF" },
  { key: "negociacao",        label: "Negociação",        color: "#f59e0b" },
  { key: "matricula",         label: "Matrícula",         color: "#10b981" },
  { key: "aluno_ativo",       label: "Aluno Ativo",       color: "#22c55e" },
] as const;

type StageKey = (typeof STAGES)[number]["key"];

interface LocalAluno {
  id: number;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  stage: StageKey;
  clientId: number;
}

export default function Alunos() {
  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  // Track completion per client (local state; persists during session)
  const [alunosByStage, setAlunosByStage] = useState<Record<StageKey, LocalAluno[]>>({
    novo_contato: [],
    qualificado: [],
    proposta_enviada: [],
    negociacao: [],
    matricula: [],
    aluno_ativo: [],
  });
  const [nextId, setNextId] = useState(1);

  const { data: clients } = trpc.clients.list.useQuery();

  const filteredAlunos = useMemo(() => {
    const result: Record<StageKey, LocalAluno[]> = {
      novo_contato: [],
      qualificado: [],
      proposta_enviada: [],
      negociacao: [],
      matricula: [],
      aluno_ativo: [],
    };
    STAGES.forEach(stage => {
      result[stage.key] = alunosByStage[stage.key].filter(a =>
        selectedClientId === "all" || a.clientId === Number(selectedClientId)
      );
    });
    return result;
  }, [alunosByStage, selectedClientId]);

  const totalAlunos = Object.values(filteredAlunos).reduce((acc, arr) => acc + arr.length, 0);

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const stage = (fd.get("stage") as StageKey) || "novo_contato";
    const newAluno: LocalAluno = {
      id: nextId,
      name: fd.get("name") as string,
      company: (fd.get("company") as string) || undefined,
      email: (fd.get("email") as string) || undefined,
      phone: (fd.get("phone") as string) || undefined,
      stage,
      clientId: Number(fd.get("clientId")) || 0,
    };
    setAlunosByStage(prev => ({
      ...prev,
      [stage]: [...prev[stage], newAluno],
    }));
    setNextId(n => n + 1);
    setIsCreateOpen(false);
    toast.success("Aluno adicionado!");
  }

  function moveAluno(alunoId: number, fromStage: StageKey, toStage: StageKey) {
    setAlunosByStage(prev => {
      const aluno = prev[fromStage].find(a => a.id === alunoId);
      if (!aluno) return prev;
      return {
        ...prev,
        [fromStage]: prev[fromStage].filter(a => a.id !== alunoId),
        [toStage]: [...prev[toStage], { ...aluno, stage: toStage }],
      };
    });
    toast.success("Aluno movido!");
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Alunos</h1>
            <p className="text-muted-foreground">Pipeline de {totalAlunos} aluno(s) em 6 etapas</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="shrink-0">
                <Plus className="h-4 w-4 mr-2" />Novo Aluno
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Adicionar Aluno</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input name="name" required placeholder="Nome completo" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>E-mail</Label>
                    <Input name="email" type="email" placeholder="email@exemplo.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input name="phone" placeholder="(11) 99999-9999" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Empresa / Escola</Label>
                  <Input name="company" placeholder="Nome da empresa" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cliente</Label>
                    <select name="clientId" className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm text-foreground">
                      <option value="">Selecione...</option>
                      {clients?.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Etapa inicial</Label>
                    <select name="stage" className="w-full rounded-md border border-input bg-input px-3 py-2 text-sm text-foreground">
                      {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <Button type="submit" className="w-full">Adicionar Aluno</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Client filter */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedClientId === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedClientId("all")}
          >
            Todos os clientes
          </Button>
          {clients?.map(c => (
            <Button
              key={c.id}
              variant={selectedClientId === String(c.id) ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedClientId(String(c.id))}
            >
              {c.companyName}
            </Button>
          ))}
        </div>

        {/* Kanban board - 6 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
          {STAGES.map((stage, stageIndex) => {
            const alunos = filteredAlunos[stage.key];
            return (
              <div key={stage.key} className="flex flex-col gap-3 min-w-0">
                {/* Column header */}
                <div
                  className="flex items-center justify-between px-3 py-2 rounded-lg border"
                  style={{
                    borderColor: stage.color + "40",
                    background: stage.color + "10",
                  }}
                >
                  <span className="text-sm font-semibold" style={{ color: stage.color }}>
                    {stage.label}
                  </span>
                  <span
                    className="text-xs font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{ color: stage.color, background: stage.color + "20" }}
                  >
                    {alunos.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2 min-h-[80px]">
                  {alunos.map(aluno => (
                    <Card
                      key={aluno.id}
                      className="border-border hover:card-glow transition-shadow"
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                              style={{ background: stage.color + "20", color: stage.color }}
                            >
                              {aluno.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium truncate">{aluno.name}</span>
                          </div>
                        </div>

                        {aluno.company && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Building2 className="h-3 w-3 shrink-0" />
                            <span className="truncate">{aluno.company}</span>
                          </div>
                        )}
                        {aluno.email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">{aluno.email}</span>
                          </div>
                        )}

                        {/* Move controls */}
                        <div className="flex gap-1 pt-1">
                          {stageIndex > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs px-2 flex-1"
                              onClick={() => moveAluno(aluno.id, stage.key, STAGES[stageIndex - 1].key)}
                            >
                              ←
                            </Button>
                          )}
                          {stageIndex < STAGES.length - 1 && (
                            <Button
                              size="sm"
                              className="h-6 text-xs px-2 flex-1"
                              style={{ background: stage.color }}
                              onClick={() => moveAluno(aluno.id, stage.key, STAGES[stageIndex + 1].key)}
                            >
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {alunos.length === 0 && (
                    <div
                      className="flex items-center justify-center h-16 rounded-lg border border-dashed text-xs text-muted-foreground"
                      style={{ borderColor: stage.color + "30" }}
                    >
                      Nenhum aluno
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
