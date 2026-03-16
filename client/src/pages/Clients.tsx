import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Building2, Phone, Mail, MapPin, Edit, Trash2, User2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statusLabels: Record<string, { label: string; color: string }> = {
  prospect: { label: "Prospect", color: "bg-blue-500/15 text-blue-400" },
  active: { label: "Ativo", color: "bg-emerald-500/15 text-emerald-400" },
  paused: { label: "Pausado", color: "bg-amber-500/15 text-amber-400" },
  churned: { label: "Churned", color: "bg-red-500/15 text-red-400" },
};

export default function Clients() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);

  const { data: clients, isLoading } = trpc.clients.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.clients.create.useMutation({
    onSuccess: () => { utils.clients.list.invalidate(); setIsCreateOpen(false); toast.success("Cliente criado com sucesso!"); },
    onError: () => toast.error("Erro ao criar cliente"),
  });

  const updateMutation = trpc.clients.update.useMutation({
    onSuccess: () => { utils.clients.list.invalidate(); setEditingClient(null); toast.success("Cliente atualizado!"); },
    onError: () => toast.error("Erro ao atualizar cliente"),
  });

  const deleteMutation = trpc.clients.delete.useMutation({
    onSuccess: () => { utils.clients.list.invalidate(); toast.success("Cliente removido!"); },
    onError: () => toast.error("Erro ao remover cliente"),
  });

  const filtered = clients?.filter((c) => {
    const matchSearch = c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.contactName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  }) ?? [];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>, isEdit = false) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: any = {
      companyName: fd.get("companyName") as string,
      tradeName: (fd.get("tradeName") as string) || undefined,
      cnpj: (fd.get("cnpj") as string) || undefined,
      segment: (fd.get("segment") as string) || undefined,
      contactName: fd.get("contactName") as string,
      contactEmail: (fd.get("contactEmail") as string) || undefined,
      contactPhone: (fd.get("contactPhone") as string) || undefined,
      contactRole: (fd.get("contactRole") as string) || undefined,
      city: (fd.get("city") as string) || undefined,
      state: (fd.get("state") as string) || undefined,
      status: (fd.get("status") as string) || "prospect",
      notes: (fd.get("notes") as string) || undefined,
    };
    if (isEdit && editingClient) {
      updateMutation.mutate({ id: editingClient.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  }

  function ClientForm({ client, onSubmit }: { client?: any; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void }) {
    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Razão Social *</Label>
            <Input id="companyName" name="companyName" defaultValue={client?.companyName} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tradeName">Nome Fantasia</Label>
            <Input id="tradeName" name="tradeName" defaultValue={client?.tradeName} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" name="cnpj" defaultValue={client?.cnpj} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="segment">Segmento</Label>
            <Input id="segment" name="segment" defaultValue={client?.segment} placeholder="Ex: Educação, Saúde..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactName">Nome do Contato *</Label>
            <Input id="contactName" name="contactName" defaultValue={client?.contactName} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">E-mail</Label>
            <Input id="contactEmail" name="contactEmail" type="email" defaultValue={client?.contactEmail} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Telefone</Label>
            <Input id="contactPhone" name="contactPhone" defaultValue={client?.contactPhone} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactRole">Cargo</Label>
            <Input id="contactRole" name="contactRole" defaultValue={client?.contactRole} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input id="city" name="city" defaultValue={client?.city} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Input id="state" name="state" maxLength={2} defaultValue={client?.state} placeholder="UF" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select name="status" defaultValue={client?.status || "prospect"} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="prospect">Prospect</option>
            <option value="active">Ativo</option>
            <option value="paused">Pausado</option>
            <option value="churned">Churned</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea id="notes" name="notes" defaultValue={client?.notes} rows={3} />
        </div>
        <Button type="submit" className="w-full">{client ? "Atualizar" : "Criar Cliente"}</Button>
      </form>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">Gerencie seus clientes e prospects</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Novo Cliente</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Cliente</DialogTitle>
              </DialogHeader>
              <ClientForm onSubmit={(e) => handleSubmit(e, false)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por empresa ou contato..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="paused">Pausado</SelectItem>
              <SelectItem value="churned">Churned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-32 bg-muted rounded" /></CardContent></Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Nenhum cliente encontrado</h3>
              <p className="text-muted-foreground mt-1">Comece adicionando seu primeiro cliente.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((client) => (
              <Card key={client.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{client.companyName}</CardTitle>
                      {client.tradeName && <p className="text-sm text-muted-foreground">{client.tradeName}</p>}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusLabels[client.status]?.color}`}>
                      {statusLabels[client.status]?.label}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User2 className="h-4 w-4 text-muted-foreground" />
                    <span>{client.contactName}</span>
                    {client.contactRole && <span className="text-muted-foreground">({client.contactRole})</span>}
                  </div>
                  {client.contactEmail && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{client.contactEmail}</span>
                    </div>
                  )}
                  {client.contactPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{client.contactPhone}</span>
                    </div>
                  )}
                  {(client.city || client.state) && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{[client.city, client.state].filter(Boolean).join(", ")}</span>
                    </div>
                  )}
                  {client.segment && (
                    <span className="inline-block mt-2 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">{client.segment}</span>
                  )}
                  <div className="flex gap-2 pt-3 border-t">
                    <Dialog open={editingClient?.id === client.id} onOpenChange={(open) => !open && setEditingClient(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditingClient(client)}>
                          <Edit className="h-3 w-3 mr-1" />Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>Editar Cliente</DialogTitle></DialogHeader>
                        <ClientForm client={editingClient} onSubmit={(e) => handleSubmit(e, true)} />
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => {
                      if (confirm("Tem certeza que deseja remover este cliente?")) deleteMutation.mutate({ id: client.id });
                    }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
