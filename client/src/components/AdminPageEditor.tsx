import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { deepMerge } from "@/lib/utils";
import { FileJson, RotateCcw, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type Props<T extends Record<string, any>> = {
  pageKey: string;
  defaults: T;
  className?: string;
};

export default function AdminPageEditor<T extends Record<string, any>>({ pageKey, defaults, className }: Props<T>) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const utils = trpc.useUtils();

  const query = trpc.pageConfig.get.useQuery({ pageKey }, { enabled: user?.role === "admin" });
  const upsertMutation = trpc.pageConfig.upsert.useMutation({
    onSuccess: () => {
      utils.pageConfig.get.invalidate({ pageKey });
      toast.success("Configuração da página salva.");
      setOpen(false);
    },
    onError: () => toast.error("Erro ao salvar configuração da página."),
  });
  const deleteMutation = trpc.pageConfig.delete.useMutation({
    onSuccess: () => {
      utils.pageConfig.get.invalidate({ pageKey });
      toast.success("Configuração restaurada para o padrão.");
      setOpen(false);
    },
    onError: () => toast.error("Erro ao restaurar configuração."),
  });

  const mergedConfig = useMemo(() => {
    return deepMerge(defaults, query.data?.config) as T;
  }, [defaults, query.data?.config]);

  useEffect(() => {
    if (!open) return;
    setDraft(JSON.stringify(mergedConfig, null, 2));
  }, [open, mergedConfig]);

  if (user?.role !== "admin") return null;

  function handleSave() {
    try {
      const parsed = JSON.parse(draft);
      upsertMutation.mutate({ pageKey, config: parsed });
    } catch {
      toast.error("JSON inválido. Revise a estrutura antes de salvar.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <FileJson className="mr-2 h-4 w-4" />
          Editar Página
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Editor administrativo: {pageKey}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Edite os textos e toggles desta página em JSON. As alterações ficam disponíveis apenas para usuários autenticados no portal.
          </p>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-[420px] font-mono text-xs"
            spellCheck={false}
          />
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => deleteMutation.mutate({ pageKey })}
              disabled={deleteMutation.isPending || upsertMutation.isPending}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Restaurar padrão
            </Button>
            <Button onClick={handleSave} disabled={upsertMutation.isPending || deleteMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              Salvar configuração
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}