import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Plus, Filter, GripVertical, User2, Mail, Phone, DollarSign, ArrowRight } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

export default function Funnels() {
  const [selectedFunnelId, setSelectedFunnelId] = useState<number | null>(null);
  const [isCreateFunnelOpen, setIsCreateFunnelOpen] = useState(false);
  const [isCreateLeadOpen, setIsCreateLeadOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);

  const { data: funnels } = trpc.funnels.list.useQuery();
  const { data: clients } = trpc.clients.list.useQuery();
  const selectedFunnel = funnels?.find(f => f.id === selectedFunnelId) ?? funnels?.[0];
  const actualFunnelId = selectedFunnel?.id;

  const { data: stages } = trpc.funnelStages.byFunnel.useQuery(
    { funnelId: actualFunnelId! },
    { enabled: !!actualFunnelId }
  );
  const { data: leads } = trpc.leads.byFunnel.useQuery(
    { funnelId: actualFunnelId! },
    { enabled: !!actualFunnelId }
  );

  const utils = trpc.useUtils();

  const createFunnelMutation = trpc.funnels.create.useMutation({
    onSuccess: () => { utils.funnels.list.invalidate(); setIsCreateFunnelOpen(false); toast.success("Funil criado!"); },
  });

  const createLeadMutation = trpc.leads.create.useMutation({
    onSuccess: () => { utils.leads.byFunnel.invalidate(); setIsCreateLeadOpen(false); toast.success("Lead adicionado!"); },
  });

  const updateLeadMutation = trpc.leads.update.useMutation({
    onSuccess: () => { utils.leads.byFunnel.invalidate(); toast.success("Lead movido!"); },
  });

  const leadsByStage = useMemo(() => {
    const map: Record<number, typeof leads> = {};
    stages?.forEach(s => { map[s.id] = []; });
    leads?.forEach(l => {
      if (map[l.stageId]) map[l.stageId]!.push(l);
    });
    return map;
  }, [stages, leads]);

  function handleCreateFunnel(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createFunnelMutation.mutate({
      clientId: Number(fd.get("clientId")),
      name: fd.get("name") as string,
      description: (fd.get("description") as string) || undefined,
    });
  }

  function handleCreateLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createLeadMutation.mutate({
      funnelId: actualFunnelId!,
      stageId: selectedStageId || stages![0].id,
      clientId: Number(fd.get("clientId")),
      name: fd.get("name") as string,
      email: (fd.get("email") as string) || undefined,
      phone: (fd.get("phone") as string) || undefined,
      company: (fd.get("company") as string) || undefined,
      source: (fd.get("source") as string) || undefined,
      value: fd.get("value") ? Number(fd.get("value")) : undefined,
    });
  }

  function moveLeadToStage(leadId: number, newStageId: number) {
    updateLeadMutation.mutate({ id: leadId, stageId: newStageId });
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Funis Comerciais</h1>
            <p className="text-muted-foreground">Gerencie seus funis e acompanhe leads por etapa</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isCreateFunnelOpen} onOpenChange={setIsCreateFunnelOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><Plus className="h-4 w-4 mr-2" />Novo Funil</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Novo Funil</DialogTitle></DialogHeader>
                <form onSubmit={handleCreateFunnel} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Cliente *</Label>
                    <select name="clientId" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Selecione...</option>
                      {clients?.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nome do Funil *</Label>
                    <Input name="name" required placeholder="Ex: Funil Principal" />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input name="description" placeholder="Descrição opcional" />
                  </div>
                  <Button type="submit" className="w-full">Criar Funil</Button>
                </form>
              </DialogContent>
            </Dialog>
            {actualFunnelId && (
              <Dialog open={isCreateLeadOpen} onOpenChange={setIsCreateLeadOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" />Novo Lead</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Novo Lead</DialogTitle></DialogHeader>
                  <form onSubmit={handleCreateLead} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Cliente *</Label>
                      <select name="clientId" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        <option value="">Selecione...</option>
                        {clients?.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Nome *</Label>
                      <Input name="name" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>E-mail</Label>
                        <Input name="email" type="email" />
                      </div>
                      <div className="space-y-2">
                        <Label>Telefone</Label>
                        <Input name="phone" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Empresa</Label>
                        <Input name="company" />
                      </div>
                      <div className="space-y-2">
                        <Label>Origem</Label>
                        <Input name="source" placeholder="Ex: Google, Indicação..." />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Valor Estimado (R$)</Label>
                      <Input name="value" type="number" />
                    </div>
                    <div className="space-y-2">
                      <Label>Etapa Inicial</Label>
                      <select name="stageId" onChange={(e) => setSelectedStageId(Number(e.target.value))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        {stages?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <Button type="submit" className="w-full">Adicionar Lead</Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {funnels && funnels.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {funnels.map(f => (
              <Button
                key={f.id}
                variant={f.id === actualFunnelId ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFunnelId(f.id)}
              >
                <Filter className="h-3 w-3 mr-1" />{f.name}
              </Button>
            ))}
          </div>
        )}

        {!actualFunnelId ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Nenhum funil criado</h3>
              <p className="text-muted-foreground mt-1">Crie seu primeiro funil para começar a gerenciar leads.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages?.map((stage, stageIdx) => (
              <div key={stage.id} className="min-w-[280px] max-w-[320px] flex-shrink-0">
                <div className="rounded-t-lg px-4 py-3 font-semibold text-white text-sm flex items-center justify-between" style={{ backgroundColor: stage.color || "#8B5CF6" }}>
                  <span>{stage.name}</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {leadsByStage[stage.id]?.length || 0}
                  </span>
                </div>
                <div className="bg-muted/30 rounded-b-lg p-2 space-y-2 min-h-[200px]">
                  {leadsByStage[stage.id]?.map(lead => (
                    <Card key={lead.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-3 space-y-2">
                        <div className="font-medium text-sm">{lead.name}</div>
                        {lead.company && <div className="text-xs text-muted-foreground">{lead.company}</div>}
                        <div className="flex flex-wrap gap-1">
                          {lead.email && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />{lead.email}
                            </span>
                          )}
                        </div>
                        {lead.value && (
                          <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                            <DollarSign className="h-3 w-3" />R$ {lead.value.toLocaleString("pt-BR")}
                          </div>
                        )}
                        {stages && stages.length > 1 && (
                          <div className="flex gap-1 pt-2 border-t">
                            {stageIdx > 0 && (
                              <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => moveLeadToStage(lead.id, stages[stageIdx - 1].id)}>
                                ← Voltar
                              </Button>
                            )}
                            {stageIdx < stages.length - 1 && (
                              <Button variant="ghost" size="sm" className="h-6 text-xs px-2 ml-auto" onClick={() => moveLeadToStage(lead.id, stages[stageIdx + 1].id)}>
                                Avançar →
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
