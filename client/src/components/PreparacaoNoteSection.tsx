import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Edit2, Save, X, StickyNote } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  section: string;
}

export default function PreparacaoNoteSection({ section }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const utils = trpc.useUtils();
  const { data: note, isLoading } = trpc.preparacao.getNote.useQuery({ section });

  const upsertMutation = trpc.preparacao.upsertNote.useMutation({
    onSuccess: () => {
      utils.preparacao.getNote.invalidate({ section });
      setEditing(false);
      toast.success("Notas salvas!");
    },
    onError: () => toast.error("Erro ao salvar notas"),
  });

  function handleEdit() {
    setDraft(note?.content ?? "");
    setEditing(true);
  }

  function handleCancel() {
    setEditing(false);
    setDraft("");
  }

  function handleSave() {
    upsertMutation.mutate({ section, content: draft });
  }

  return (
    <Card className="border-border/60 border-dashed">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
          <StickyNote className="h-4 w-4 text-amber-400" />
          Notas da Equipe
        </CardTitle>
        {!editing ? (
          <Button variant="ghost" size="sm" onClick={handleEdit} className="h-7 gap-1.5 text-xs">
            <Edit2 className="h-3.5 w-3.5" />
            {note?.content ? "Editar" : "Adicionar nota"}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel} className="h-7 gap-1.5 text-xs">
              <X className="h-3.5 w-3.5" />
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={upsertMutation.isPending} className="h-7 gap-1.5 text-xs">
              <Save className="h-3.5 w-3.5" />
              Salvar
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-12 animate-pulse rounded bg-muted/40" />
        ) : editing ? (
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Adicione suas observações, decisões tomadas, atualizações ou qualquer informação relevante para esta seção..."
            className="min-h-[120px] resize-y text-sm"
            autoFocus
          />
        ) : note?.content ? (
          <div className="space-y-1">
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{note.content}</p>
            {note.updatedAt && (
              <p className="text-xs text-muted-foreground/50 pt-1">
                Atualizado em {new Date(note.updatedAt).toLocaleString("pt-BR")}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground/50 italic">
            Nenhuma nota adicionada ainda. Clique em "Adicionar nota" para registrar observações da equipe.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
