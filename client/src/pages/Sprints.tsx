import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { CalendarCheck, Plus, CheckCircle, Circle, Clock, Rocket, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  planned: { label: "Planejado", color: "bg-blue-500/15 text-blue-400", icon: Clock },
  in_progress: { label: "Em Andamento", color: "bg-amber-500/15 text-amber-400", icon: Rocket },
  completed: { label: "Concluído", color: "bg-emerald-500/15 text-emerald-400", icon: CheckCircle },
};

export default function Sprints() {
  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [expandedSprint, setExpandedSprint] = useState<number | null>(null);

  const { data: clients } = trpc.clients.list.useQuery();
  const { data: sprints, isLoading } = trpc.sprints.list.useQuery();
  const utils = trpc.useUtils();

  const createFullSprint = trpc.sprints.createFullSprint.useMutation({
    onSuccess: () => { utils.sprints.list.invalidate(); setIsCreateOpen(false); toast.success("Sprint de 4 semanas criado!"); },
  });

  const updateSprint = trpc.sprints.update.useMutation({
    onSuccess: () => { utils.sprints.list.invalidate(); toast.success("Sprint atualizado!"); },
  });

  const filtered = sprints?.filter(s => selectedClientId === "all" || s.clientId === Number(selectedClientId)) ?? [];

  const groupedByClient: Record<number, typeof filtered> = {};
  filtered.forEach(s => {
    if (!groupedByClient[s.clientId]) groupedByClient[s.clientId] = [];
    groupedByClient[s.clientId].push(s);
  });

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createFullSprint.mutate({
      clientId: Number(fd.get("clientId")),
      startDate: new Date(fd.get("startDate") as string),
    });
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sprints</h1>
            <p className="text-muted-foreground">Gerencie sprints de 4 semanas por cliente</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Novo Sprint (4 semanas)</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Criar Sprint de 4 Semanas</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Cliente *</Label>
                  <select name="clientId" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Selecione...</option>
                    {clients?.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Data de Início *</Label>
                  <Input name="startDate" type="date" required />
                </div>
                <p className="text-sm text-muted-foreground">Serão criadas 4 semanas com tarefas pré-definidas baseadas na metodologia Wayzen.</p>
                <Button type="submit" className="w-full" disabled={createFullSprint.isPending}>
                  {createFullSprint.isPending ? "Criando..." : "Criar Sprint Completo"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button variant={selectedClientId === "all" ? "default" : "outline"} size="sm" onClick={() => setSelectedClientId("all")}>
            Todos
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

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-20 bg-muted rounded" /></CardContent></Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="p-12 text-center">
            <CalendarCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Nenhum sprint encontrado</h3>
            <p className="text-muted-foreground mt-1">Crie um sprint de 4 semanas para começar.</p>
          </CardContent></Card>
        ) : (
          Object.entries(groupedByClient).map(([clientId, clientSprints]) => {
            const client = clients?.find(c => c.id === Number(clientId));
            return (
              <div key={clientId} className="space-y-3">
                <h2 className="text-lg font-semibold text-primary">{client?.companyName || `Cliente #${clientId}`}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clientSprints.sort((a, b) => a.weekNumber - b.weekNumber).map(sprint => {
                    const status = statusConfig[sprint.status];
                    const StatusIcon = status.icon;
                    const isExpanded = expandedSprint === sprint.id;
                    return (
                      <SprintCard
                        key={sprint.id}
                        sprint={sprint}
                        status={status}
                        StatusIcon={StatusIcon}
                        isExpanded={isExpanded}
                        onToggle={() => setExpandedSprint(isExpanded ? null : sprint.id)}
                        onStatusChange={(newStatus: string) => updateSprint.mutate({ id: sprint.id, status: newStatus as any })}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
}

function SprintCard({ sprint, status, StatusIcon, isExpanded, onToggle, onStatusChange }: any) {
  const { data: tasks } = trpc.sprintTasks.bySprint.useQuery({ sprintId: sprint.id });
  const utils = trpc.useUtils();
  const toggleTask = trpc.sprintTasks.toggleComplete.useMutation({
    onSuccess: () => utils.sprintTasks.bySprint.invalidate(),
  });

  const completedCount = tasks?.filter(t => t.isCompleted).length ?? 0;
  const totalCount = tasks?.length ?? 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{sprint.name}</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                <StatusIcon className="h-3 w-3 inline mr-1" />{status.label}
              </span>
              <span className="text-xs text-muted-foreground">{completedCount}/{totalCount} tarefas</span>
            </div>
          </div>
          {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-2">
          {sprint.startDate && sprint.endDate && (
            <p className="text-xs text-muted-foreground">
              {new Date(sprint.startDate).toLocaleDateString("pt-BR")} — {new Date(sprint.endDate).toLocaleDateString("pt-BR")}
            </p>
          )}
          <div className="flex gap-1 mb-3">
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => onStatusChange("planned")}>Planejado</Button>
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => onStatusChange("in_progress")}>Em Andamento</Button>
            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => onStatusChange("completed")}>Concluído</Button>
          </div>
          {tasks?.map(task => (
            <div key={task.id} className="flex items-start gap-2 py-1">
              <Checkbox
                checked={task.isCompleted}
                onCheckedChange={(checked) => toggleTask.mutate({ id: task.id, isCompleted: !!checked })}
                className="mt-0.5"
              />
              <span className={`text-sm ${task.isCompleted ? "line-through text-muted-foreground" : ""}`}>{task.title}</span>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
