import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package2,
  Target,
  TrendingUp,
  Handshake,
  ClipboardList,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import { useLocation } from "wouter";

const sections = [
  {
    path: "/preparacao/produto",
    icon: Package2,
    label: "Definição do Produto",
    description: "Nome do serviço, promessa central, vocabulário e entregáveis dos 4 sprints.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    path: "/preparacao/icp",
    icon: Target,
    label: "ICP — Cliente Ideal",
    description: "Perfil do cliente certo para o Método ERO's e red flags de quem não é ICP.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    path: "/preparacao/processo",
    icon: TrendingUp,
    label: "Processo Comercial",
    description: "Funil em 6 etapas estruturadas para a Wayzen vender seu próprio serviço.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    path: "/preparacao/onboarding",
    icon: Handshake,
    label: "Onboarding do Cliente",
    description: "Sequência coreografada da Semana 0 para causar o Efeito UAU no cliente.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    path: "/preparacao/atividades",
    icon: ClipboardList,
    label: "Atividades Práticas",
    description: "Checklists por frente (Produto, Comercial, Operação, Marca) para colocar a Wayzen de pé.",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    path: "/preparacao/cronograma",
    icon: CalendarDays,
    label: "Cronograma de Lançamento",
    description: "Plano interativo de 6 semanas com filtros por responsável, progresso e checklist persistente.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
  },
];

export default function Preparacao() {
  const [, setLocation] = useLocation();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Preparação Essencial</h1>
          <p className="text-muted-foreground">
            Quem somos antes de começar — base estratégica interna da Wayzen
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sections.map(({ path, icon: Icon, label, description, color, bg }) => (
            <Card
              key={path}
              className="border-border/60 cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-all group"
              onClick={() => setLocation(path)}
            >
              <CardHeader className="pb-2">
                <div className={`h-9 w-9 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  {label}
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs">{description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
