import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { BookOpen, Plus, Search, Edit, Trash2, FileText, Shield, ListChecks, ScrollText, ClipboardList } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

const categoryConfig: Record<string, { label: string; icon: any; color: string }> = {
  script: { label: "Script de Vendas", icon: ScrollText, color: "bg-blue-500/15 text-blue-400" },
  objection_matrix: { label: "Matriz de Objeções", icon: Shield, color: "bg-red-500/15 text-red-400" },
  playbook: { label: "Playbook", icon: BookOpen, color: "bg-purple-500/15 text-purple-400" },
  template: { label: "Template", icon: FileText, color: "bg-emerald-500/15 text-emerald-400" },
  checklist: { label: "Checklist", icon: ListChecks, color: "bg-amber-500/15 text-amber-400" },
};

export default function Playbooks() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingPlaybook, setViewingPlaybook] = useState<any>(null);
  const [editingPlaybook, setEditingPlaybook] = useState<any>(null);

  const { data: playbooks, isLoading } = trpc.playbooks.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.playbooks.create.useMutation({
    onSuccess: () => { utils.playbooks.list.invalidate(); setIsCreateOpen(false); toast.success("Playbook criado!"); },
  });

  const updateMutation = trpc.playbooks.update.useMutation({
    onSuccess: () => { utils.playbooks.list.invalidate(); setEditingPlaybook(null); toast.success("Playbook atualizado!"); },
  });

  const deleteMutation = trpc.playbooks.delete.useMutation({
    onSuccess: () => { utils.playbooks.list.invalidate(); toast.success("Playbook removido!"); },
  });

  const filtered = playbooks?.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.segment?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCategory;
  }) ?? [];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>, isEdit = false) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      title: fd.get("title") as string,
      category: fd.get("category") as any,
      segment: (fd.get("segment") as string) || undefined,
      content: fd.get("content") as string,
      tags: (fd.get("tags") as string) || undefined,
    };
    if (isEdit && editingPlaybook) {
      updateMutation.mutate({ id: editingPlaybook.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  }

  function PlaybookForm({ playbook, onSubmit }: { playbook?: any; onSubmit: (e: React.FormEvent<HTMLFormElement>) => void }) {
    return (
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Título *</Label>
          <Input name="title" defaultValue={playbook?.title} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Categoria *</Label>
            <select name="category" defaultValue={playbook?.category || "playbook"} required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="script">Script de Vendas</option>
              <option value="objection_matrix">Matriz de Objeções</option>
              <option value="playbook">Playbook</option>
              <option value="template">Template</option>
              <option value="checklist">Checklist</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Segmento</Label>
            <Input name="segment" defaultValue={playbook?.segment} placeholder="Ex: Educação, Saúde..." />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Tags (separadas por vírgula)</Label>
          <Input name="tags" defaultValue={playbook?.tags} placeholder="Ex: vendas, objeções, follow-up" />
        </div>
        <div className="space-y-2">
          <Label>Conteúdo * (suporta Markdown)</Label>
          <Textarea name="content" defaultValue={playbook?.content} rows={12} required placeholder="Escreva o conteúdo do playbook aqui..." />
        </div>
        <Button type="submit" className="w-full">{playbook ? "Atualizar" : "Criar Playbook"}</Button>
      </form>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Playbooks</h1>
            <p className="text-muted-foreground">Biblioteca de scripts, playbooks e matrizes de objeções</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Novo Playbook</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Novo Playbook</DialogTitle></DialogHeader>
              <PlaybookForm onSubmit={(e) => handleSubmit(e, false)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por título ou segmento..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant={categoryFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setCategoryFilter("all")}>Todos</Button>
            {Object.entries(categoryConfig).map(([key, config]) => (
              <Button key={key} variant={categoryFilter === key ? "default" : "outline"} size="sm" onClick={() => setCategoryFilter(key)}>
                <config.icon className="h-3 w-3 mr-1" />{config.label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-24 bg-muted rounded" /></CardContent></Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Nenhum playbook encontrado</h3>
            <p className="text-muted-foreground mt-1">Crie seu primeiro playbook para a equipe.</p>
          </CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(pb => {
              const cat = categoryConfig[pb.category];
              const CatIcon = cat?.icon || BookOpen;
              return (
                <Card key={pb.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setViewingPlaybook(pb)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{pb.title}</CardTitle>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat?.color}`}>
                        <CatIcon className="h-3 w-3 inline mr-1" />{cat?.label}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {pb.segment && <span className="inline-block px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium">{pb.segment}</span>}
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{pb.content.substring(0, 150)}...</p>
                    {pb.tags && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {pb.tags.split(",").map((tag: string, i: number) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-muted text-xs text-muted-foreground">{tag.trim()}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 pt-3 mt-3 border-t" onClick={e => e.stopPropagation()}>
                      <Dialog open={editingPlaybook?.id === pb.id} onOpenChange={(open) => !open && setEditingPlaybook(null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditingPlaybook(pb)}>
                            <Edit className="h-3 w-3 mr-1" />Editar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader><DialogTitle>Editar Playbook</DialogTitle></DialogHeader>
                          <PlaybookForm playbook={editingPlaybook} onSubmit={(e) => handleSubmit(e, true)} />
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => {
                        if (confirm("Remover este playbook?")) deleteMutation.mutate({ id: pb.id });
                      }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Dialog open={!!viewingPlaybook} onOpenChange={(open) => !open && setViewingPlaybook(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewingPlaybook?.title}</DialogTitle>
            </DialogHeader>
            <div className="prose prose-sm max-w-none">
              <Streamdown>{viewingPlaybook?.content || ""}</Streamdown>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
