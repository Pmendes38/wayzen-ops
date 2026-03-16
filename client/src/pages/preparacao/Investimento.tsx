import PreparacaoNoteSection from "@/components/PreparacaoNoteSection";
import PreparacaoPageLayout from "@/components/PreparacaoPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">{children}</CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 border-b border-border/40 pb-2">
      <span className="min-w-[200px] font-medium text-foreground/80">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

export default function PreparacaoInvestimento() {
  return (
    <PreparacaoPageLayout
      title="Investimento Inicial"
      description="Breakdown por categoria, total aportado pelos sócios e participação de cada um."
    >
      <div className="grid sm:grid-cols-3 gap-4">
        <SectionCard title="Marketing">
          <InfoRow label="Tráfego pago inicial" value="R$ 1.250" />
          <InfoRow label="Fotografia" value="R$ 250" />
          <p className="font-semibold text-foreground pt-1 border-t border-border/40">Subtotal: R$ 1.500</p>
        </SectionCard>

        <SectionCard title="Material de Marca">
          <InfoRow label="Camisetas" value="R$ 180" />
          <InfoRow label="Crachás" value="R$ 90" />
          <InfoRow label="Broches" value="R$ 43,90" />
          <InfoRow label="Cartões de visita" value="R$ 52,50" />
          <InfoRow label="Folders" value="R$ 292,50" />
          <InfoRow label="Envelopes personalizados" value="R$ 193,50" />
          <p className="font-semibold text-foreground pt-1 border-t border-border/40">Subtotal: R$ 852,40</p>
        </SectionCard>

        <SectionCard title="Estrutura Digital">
          <InfoRow label="Hospedagem + domínio" value="R$ 120" />
          <InfoRow label="CRM Kommo (1 usuário)" value="R$ 129/mês" />
          <InfoRow label="Empresa Aqui (prospecção)" value="R$ 299,90" />
          <p className="font-semibold text-foreground pt-1 border-t border-border/40">Subtotal: R$ 548,90</p>
        </SectionCard>
      </div>

      <Card className="border-primary/30 bg-primary/10">
        <CardContent className="pt-4 flex items-center justify-between">
          <span className="font-semibold text-foreground">Total do investimento inicial</span>
          <span className="text-2xl font-bold text-primary">R$ 2.901,30</span>
        </CardContent>
      </Card>

      <SectionCard title="Taxa operacional mensal">
        <InfoRow label="Taxa fixa" value="R$ 600 + Taxa CRM" />
      </SectionCard>

      <SectionCard title="Participação dos sócios">
        <div className="flex flex-wrap gap-3">
          {[
            { name: "Pedro", stake: "50%", value: "R$ 1.450" },
            { name: "Danielle", stake: "30%", value: "R$ 870" },
            { name: "Matheus", stake: "20%", value: "R$ 580" },
          ].map((p) => (
            <div key={p.name} className="rounded-lg border border-border/60 p-4 flex-1 min-w-[120px] space-y-1 text-center">
              <p className="font-semibold text-foreground">{p.name}</p>
              <p className="text-2xl font-bold text-primary">{p.stake}</p>
              <p className="text-xs text-muted-foreground">{p.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <PreparacaoNoteSection section="investimento" />
    </PreparacaoPageLayout>
  );
}
