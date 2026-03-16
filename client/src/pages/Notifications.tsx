import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Bell, CheckCheck, Clock, Target, CalendarCheck, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";

const typeConfig: Record<string, { label: string; icon: any; color: string }> = {
  task_due: { label: "Tarefa Pendente", icon: Clock, color: "text-amber-400" },
  follow_up: { label: "Follow-up", icon: Target, color: "text-blue-400" },
  sprint_update: { label: "Sprint", icon: CalendarCheck, color: "text-[#BF00FF]" },
  lead_update: { label: "Aluno", icon: AlertTriangle, color: "text-orange-400" },
  system: { label: "Sistema", icon: Info, color: "text-muted-foreground" },
};

export default function Notifications() {
  const { data: notifications, isLoading } = trpc.notifications.list.useQuery();
  const utils = trpc.useUtils();

  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => utils.notifications.list.invalidate(),
  });

  const markAllRead = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => { utils.notifications.list.invalidate(); toast.success("Todas marcadas como lidas!"); },
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notificações</h1>
            <p className="text-muted-foreground">{unreadCount > 0 ? `${unreadCount} não lida(s)` : "Todas as notificações lidas"}</p>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" onClick={() => markAllRead.mutate()}>
              <CheckCheck className="h-4 w-4 mr-2" />Marcar todas como lidas
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="animate-pulse"><CardContent className="p-4"><div className="h-12 bg-muted rounded" /></CardContent></Card>
            ))}
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <Card><CardContent className="p-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Nenhuma notificação</h3>
            <p className="text-muted-foreground mt-1">Você será notificado sobre tarefas, follow-ups e atualizações.</p>
          </CardContent></Card>
        ) : (
          <div className="space-y-2">
            {notifications.map(notif => {
              const config = typeConfig[notif.type] || typeConfig.system;
              const Icon = config.icon;
              return (
                <Card
                  key={notif.id}
                  className={`hover:shadow-md transition-shadow cursor-pointer ${!notif.isRead ? "border-l-4 border-l-primary bg-primary/5" : ""}`}
                  onClick={() => { if (!notif.isRead) markRead.mutate({ id: notif.id }); }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-sm ${!notif.isRead ? "font-semibold" : "font-medium"}`}>{notif.title}</h3>
                          <span className="text-xs text-muted-foreground">{new Date(notif.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        {notif.message && <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>}
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${config.color} bg-opacity-10`}>{config.label}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
