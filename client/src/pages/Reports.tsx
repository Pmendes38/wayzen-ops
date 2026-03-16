import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { FileText, Plus, Calendar, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function Reports() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<any>(null);

  const { data: reports, isLoading } = trpc.reports.list.useQuery();
  const { data: clients } = trpc.clients.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.reports.create.useMutation({
    onSuccess: () => { utils.reports.list.invalidate(); setIsCreateOpen(false); toast.success("Relatório criado!"); },
  });

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      clientId: Number(fd.get("clientId")),
      type: fd.get("type") as any,
      title: fd.get("title") as string,
      periodStart: new Date(fd.get("periodStart") as string),
      periodEnd: new Date(fd.get("periodEnd") as string),
      content: (fd.get("content") as string) || undefined,
      metrics: (fd.get("metrics") as string) || undefined,
    });
  }

  function getClientName(clientId: number) {
    return clients?.find(c => c.id === clientId)?.companyName || `Cliente #${clientId}`;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-muted-foreground">Relatórios semanais e mensais por cliente</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Novo Relatório</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Novo Relatório</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cliente *</Label>
                    <select name="clientId" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Selecione...</option>
                      {clients?.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo *</Label>
                    <select name="type" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Título *</Label>
                  <Input name="title" required placeholder="Ex: Relatório Semanal - Semana 1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Início do Período *</Label>
                    <Input name="periodStart" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Fim do Período *</Label>
                    <Input name="periodEnd" type="date" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Métricas (JSON ou texto)</Label>
                  <Textarea name="metrics" rows={3} placeholder='Ex: {"leads_recebidos": 15, "propostas_enviadas": 5}' />
                </div>
                <div className="space-y-2">
                  <Label>Conteúdo (suporta Markdown)</Label>
                  <Textarea name="content" rows={8} placeholder="Escreva o conteúdo do relatório aqui..." />
                </div>
                <Button type="submit" className="w-full">Criar Relatório</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="animate-pulse"><CardContent className="p-4"><div className="h-16 bg-muted rounded" /></CardContent></Card>
            ))}
          </div>
        ) : !reports || reports.length === 0 ? (
          <Card><CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Nenhum relatório encontrado</h3>
            <p className="text-muted-foreground mt-1">Crie seu primeiro relatório para um cliente.</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-3">
            {reports.map(report => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{report.title}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${report.type === "weekly" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                          {report.type === "weekly" ? "Semanal" : "Mensal"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>{getClientName(report.clientId)}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(report.periodStart).toLocaleDateString("pt-BR")} — {new Date(report.periodEnd).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setViewingReport(report)}>
                      <Eye className="h-4 w-4 mr-1" />Ver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!viewingReport} onOpenChange={(open) => !open && setViewingReport(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewingReport?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{viewingReport?.type === "weekly" ? "Relatório Semanal" : "Relatório Mensal"}</span>
                <span>{viewingReport?.periodStart && new Date(viewingReport.periodStart).toLocaleDateString("pt-BR")} — {viewingReport?.periodEnd && new Date(viewingReport.periodEnd).toLocaleDateString("pt-BR")}</span>
              </div>
              {viewingReport?.metrics && (
                <Card>
                  <CardHeader><CardTitle className="text-sm">Métricas</CardTitle></CardHeader>
                  <CardContent><pre className="text-sm bg-muted p-3 rounded overflow-x-auto">{viewingReport.metrics}</pre></CardContent>
                </Card>
              )}
              {viewingReport?.content && (
                <div className="prose prose-sm max-w-none">
                  <Streamdown>{viewingReport.content}</Streamdown>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
