import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";

interface Props {
  title: string;
  description: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function PreparacaoPageLayout({ title, description, children, actions }: Props) {
  const [, setLocation] = useLocation();
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8 mt-0.5 shrink-0" onClick={() => setLocation("/preparacao")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Preparação Essencial</p>
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
        {children}
      </div>
    </DashboardLayout>
  );
}
