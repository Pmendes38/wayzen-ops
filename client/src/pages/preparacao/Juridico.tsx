import PreparacaoNoteSection from "@/components/PreparacaoNoteSection";
import PreparacaoPageLayout from "@/components/PreparacaoPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";

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

export default function PreparacaoJuridico() {
  return (
    <PreparacaoPageLayout
      title="Custos Jurídicos"
      description="Estrutura jurídica necessária após o primeiro cliente, com ordem de prioridade."
    >
      <div className="rounded-md border border-blue-500/30 bg-blue-500/10 p-3 flex gap-2">
        <AlertCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-blue-200/80 text-sm">
          Esses custos entram <strong>após o fechamento do primeiro cliente</strong>. Não comprometa o caixa antes disso.
        </p>
      </div>

      <SectionCard title="Custos jurídicos e estruturais">
        <InfoRow label="Contrato para clientes" value="R$ 5.000" />
        <InfoRow label="Contrato social" value="R$ 5.000" />
        <InfoRow label="Registro de marca" value="R$ 1.500 a R$ 3.000" />
        <InfoRow label="Abertura de CNPJ" value="R$ 200 a R$ 800" />
        <InfoRow label="Contador mensal" value="R$ 200 a R$ 600" />
        <p className="text-xs text-muted-foreground/70 italic pt-1">Valores baseados em médias de mercado no Brasil.</p>
      </SectionCard>

      <SectionCard title="Prioridade de execução jurídica">
        <ul className="space-y-1.5">
          {[
            "1.º — Fechar o primeiro cliente (valida o modelo antes de gastar com estrutura)",
            "2.º — Abrir CNPJ e contratar contador",
            "3.º — Elaborar contratos de prestação de serviço para clientes",
            "4.º — Contrato social entre os sócios",
            "5.º — Registro de marca na INPI",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      <PreparacaoNoteSection section="juridico" />
    </PreparacaoPageLayout>
  );
}
