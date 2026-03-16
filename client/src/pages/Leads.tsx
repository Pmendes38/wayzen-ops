import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Target, Search, Mail, Phone, Building2, DollarSign, MessageSquare, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  open: { label: "Aberto", color: "bg-amber-500/15 text-amber-400", icon: Clock },
  won: { label: "Ganho", color: "bg-emerald-500/15 text-emerald-400", icon: CheckCircle },
  lost: { label: "Perdido", color: "bg-red-500/15 text-red-400", icon: XCircle },
};

const interactionTypes: Record<string, { label: string; color: string }> = {
  email: { label: "E-mail", color: "bg-blue-500/15 text-blue-400" },
  call: { label: "Ligação", color: "bg-emerald-500/15 text-emerald-400" },
  meeting: { label: "Reunião", color: "bg-purple-500/15 text-purple-400" },
  whatsapp: { label: "WhatsApp", color: "bg-teal-500/15 text-teal-400" },
  note: { label: "Nota", color: "bg-muted text-muted-foreground" },
  follow_up: { label: "Follow-up", color: "bg-orange-500/15 text-orange-400" },
};

export default function Leads() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [isInteractionOpen, setIsInteractionOpen] = useState(false);

  const { data: leads, isLoading } = trpc.leads.list.useQuery();
  const { data: interactions } = trpc.interactions.byLead.useQuery(
    { leadId: selectedLeadId! },
    { enabled: !!selectedLeadId }
  );
  const utils = trpc.useUtils();

  const createInteraction = trpc.interactions.create.useMutation({
    onSuccess: () => { utils.interactions.byLead.invalidate(); setIsInteractionOpen(false); toast.success("Interação registrada!"); },
  });

  const updateLead = trpc.leads.update.useMutation({
    onSuccess: () => { utils.leads.list.invalidate(); toast.success("Lead atualizado!"); },
  });

  const filtered = leads?.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.company?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  }) ?? [];

  const selectedLead = leads?.find(l => l.id === selectedLeadId);

  function handleInteraction(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createInteraction.mutate({
      leadId: selectedLeadId!,
      type: fd.get("type") as any,
      subject: (fd.get("subject") as string) || undefined,
      content: (fd.get("content") as string) || undefined,
    });
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">Acompanhe e gerencie todos os leads da operação</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou empresa..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="open">Abertos</SelectItem>
              <SelectItem value="won">Ganhos</SelectItem>
              <SelectItem value="lost">Perdidos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="animate-pulse"><CardContent className="p-4"><div className="h-16 bg-muted rounded" /></CardContent></Card>
              ))
            ) : filtered.length === 0 ? (
              <Card><CardContent className="p-12 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Nenhum lead encontrado</h3>
                <p className="text-muted-foreground mt-1">Adicione leads através dos funis comerciais.</p>
              </CardContent></Card>
            ) : (
              filtered.map(lead => {
                const status = statusConfig[lead.status];
                const StatusIcon = status.icon;
                return (
                  <Card
                    key={lead.id}
                    className={`hover:shadow-md transition-shadow cursor-pointer ${selectedLeadId === lead.id ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setSelectedLeadId(lead.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{lead.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                              <StatusIcon className="h-3 w-3 inline mr-1" />{status.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                            {lead.company && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{lead.company}</span>}
                            {lead.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{lead.email}</span>}
                            {lead.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{lead.phone}</span>}
                            {lead.value && <span className="flex items-center gap-1 text-green-600 font-medium"><DollarSign className="h-3 w-3" />R$ {lead.value.toLocaleString("pt-BR")}</span>}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {lead.status === "open" && (
                            <>
                              <Button variant="ghost" size="sm" className="text-green-600 h-8" onClick={(e) => { e.stopPropagation(); updateLead.mutate({ id: lead.id, status: "won", closedAt: new Date() }); }}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600 h-8" onClick={(e) => { e.stopPropagation(); updateLead.mutate({ id: lead.id, status: "lost", closedAt: new Date() }); }}>
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <div className="space-y-4">
            {selectedLead ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      Detalhes do Lead
                      <Dialog open={isInteractionOpen} onOpenChange={setIsInteractionOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm"><Plus className="h-3 w-3 mr-1" />Interação</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Nova Interação</DialogTitle></DialogHeader>
                          <form onSubmit={handleInteraction} className="space-y-4">
                            <div className="space-y-2">
                              <Label>Tipo *</Label>
                              <select name="type" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="email">E-mail</option>
                                <option value="call">Ligação</option>
                                <option value="meeting">Reunião</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="note">Nota</option>
                                <option value="follow_up">Follow-up</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label>Assunto</Label>
                              <Input name="subject" />
                            </div>
                            <div className="space-y-2">
                              <Label>Conteúdo</Label>
                              <Textarea name="content" rows={4} />
                            </div>
                            <Button type="submit" className="w-full">Registrar</Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div><span className="text-sm text-muted-foreground">Nome:</span><p className="font-medium">{selectedLead.name}</p></div>
                    {selectedLead.company && <div><span className="text-sm text-muted-foreground">Empresa:</span><p className="font-medium">{selectedLead.company}</p></div>}
                    {selectedLead.email && <div><span className="text-sm text-muted-foreground">E-mail:</span><p className="font-medium">{selectedLead.email}</p></div>}
                    {selectedLead.phone && <div><span className="text-sm text-muted-foreground">Telefone:</span><p className="font-medium">{selectedLead.phone}</p></div>}
                    {selectedLead.source && <div><span className="text-sm text-muted-foreground">Origem:</span><p className="font-medium">{selectedLead.source}</p></div>}
                    {selectedLead.notes && <div><span className="text-sm text-muted-foreground">Notas:</span><p className="text-sm">{selectedLead.notes}</p></div>}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />Histórico
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {interactions && interactions.length > 0 ? (
                      <div className="space-y-3">
                        {interactions.map(int => {
                          const typeInfo = interactionTypes[int.type];
                          return (
                            <div key={int.id} className="border-l-2 border-primary/30 pl-3 py-1">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeInfo?.color}`}>{typeInfo?.label}</span>
                                <span className="text-xs text-muted-foreground">{new Date(int.createdAt).toLocaleDateString("pt-BR")}</span>
                              </div>
                              {int.subject && <p className="font-medium text-sm mt-1">{int.subject}</p>}
                              {int.content && <p className="text-sm text-muted-foreground mt-1">{int.content}</p>}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">Nenhuma interação registrada</p>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Selecione um lead para ver detalhes e interações</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
