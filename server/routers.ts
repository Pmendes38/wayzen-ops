import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

const adminProcedure = protectedProcedure;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  users: router({
    list: adminProcedure.query(() => db.getAllUsers()),
  }),

  clients: router({
    list: protectedProcedure.query(() => db.getAllClients()),
    byId: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getClientById(input.id)),
    byStatus: protectedProcedure.input(z.object({ status: z.string() })).query(({ input }) => db.getClientsByStatus(input.status)),
    create: protectedProcedure.input(z.object({
      companyName: z.string().min(1),
      tradeName: z.string().optional(),
      cnpj: z.string().optional(),
      segment: z.string().optional(),
      contactName: z.string().min(1),
      contactEmail: z.string().optional(),
      contactPhone: z.string().optional(),
      contactRole: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      status: z.enum(["prospect", "active", "paused", "churned"]).optional(),
      notes: z.string().optional(),
      assignedUserId: z.number().optional(),
      monthlyFee: z.number().optional(),
      loaPercentage: z.number().optional(),
      contractStartDate: z.date().optional(),
      contractEndDate: z.date().optional(),
    })).mutation(({ input }) => db.createClient(input)),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      companyName: z.string().optional(),
      tradeName: z.string().optional(),
      cnpj: z.string().optional(),
      segment: z.string().optional(),
      contactName: z.string().optional(),
      contactEmail: z.string().optional(),
      contactPhone: z.string().optional(),
      contactRole: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      status: z.enum(["prospect", "active", "paused", "churned"]).optional(),
      notes: z.string().optional(),
      assignedUserId: z.number().optional(),
      monthlyFee: z.number().optional(),
      loaPercentage: z.number().optional(),
      contractStartDate: z.date().optional(),
      contractEndDate: z.date().optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return db.updateClient(id, data); }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteClient(input.id)),
  }),

  funnels: router({
    list: protectedProcedure.query(() => db.getAllFunnels()),
    byClient: protectedProcedure.input(z.object({ clientId: z.number() })).query(({ input }) => db.getFunnelsByClient(input.clientId)),
    byId: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getFunnelById(input.id)),
    create: protectedProcedure.input(z.object({
      clientId: z.number(),
      name: z.string().min(1),
      description: z.string().optional(),
    })).mutation(async ({ input }) => {
      const funnel = await db.createFunnel(input);
      const defaultStages = [
        { funnelId: funnel.id, name: "Lead", order: 1, color: "#6366F1" },
        { funnelId: funnel.id, name: "Qualificado", order: 2, color: "#8B5CF6" },
        { funnelId: funnel.id, name: "Proposta", order: 3, color: "#A855F7" },
        { funnelId: funnel.id, name: "Negociação", order: 4, color: "#D946EF" },
        { funnelId: funnel.id, name: "Fechado", order: 5, color: "#22C55E" },
      ];
      for (const stage of defaultStages) {
        await db.createFunnelStage(stage);
      }
      return funnel;
    }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteFunnel(input.id)),
  }),

  funnelStages: router({
    byFunnel: protectedProcedure.input(z.object({ funnelId: z.number() })).query(({ input }) => db.getStagesByFunnel(input.funnelId)),
    create: protectedProcedure.input(z.object({
      funnelId: z.number(),
      name: z.string().min(1),
      order: z.number(),
      color: z.string().optional(),
    })).mutation(({ input }) => db.createFunnelStage(input)),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      order: z.number().optional(),
      color: z.string().optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return db.updateFunnelStage(id, data); }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteFunnelStage(input.id)),
  }),

  leads: router({
    list: protectedProcedure.query(() => db.getAllLeads()),
    byId: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getLeadById(input.id)),
    byFunnel: protectedProcedure.input(z.object({ funnelId: z.number() })).query(({ input }) => db.getLeadsByFunnel(input.funnelId)),
    byStage: protectedProcedure.input(z.object({ stageId: z.number() })).query(({ input }) => db.getLeadsByStage(input.stageId)),
    byClient: protectedProcedure.input(z.object({ clientId: z.number() })).query(({ input }) => db.getLeadsByClient(input.clientId)),
    create: protectedProcedure.input(z.object({
      funnelId: z.number(),
      stageId: z.number(),
      clientId: z.number(),
      name: z.string().min(1),
      email: z.string().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      source: z.string().optional(),
      value: z.number().optional(),
      notes: z.string().optional(),
      assignedUserId: z.number().optional(),
    })).mutation(({ input }) => db.createLead(input)),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      stageId: z.number().optional(),
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      company: z.string().optional(),
      source: z.string().optional(),
      value: z.number().optional(),
      notes: z.string().optional(),
      lossReason: z.string().optional(),
      assignedUserId: z.number().optional(),
      status: z.enum(["open", "won", "lost"]).optional(),
      firstResponseAt: z.date().optional(),
      closedAt: z.date().optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return db.updateLead(id, data); }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteLead(input.id)),
  }),

  interactions: router({
    list: protectedProcedure.query(() => db.getAllInteractions()),
    byLead: protectedProcedure.input(z.object({ leadId: z.number() })).query(({ input }) => db.getInteractionsByLead(input.leadId)),
    byClient: protectedProcedure.input(z.object({ clientId: z.number() })).query(({ input }) => db.getInteractionsByClient(input.clientId)),
    create: protectedProcedure.input(z.object({
      leadId: z.number().optional(),
      clientId: z.number().optional(),
      type: z.enum(["email", "call", "meeting", "whatsapp", "note", "follow_up"]),
      subject: z.string().optional(),
      content: z.string().optional(),
      scheduledAt: z.date().optional(),
      completedAt: z.date().optional(),
    })).mutation(({ input, ctx }) => db.createInteraction({ ...input, userId: ctx.user.id })),
  }),

  sprints: router({
    list: protectedProcedure.query(() => db.getAllSprints()),
    byClient: protectedProcedure.input(z.object({ clientId: z.number() })).query(({ input }) => db.getSprintsByClient(input.clientId)),
    byId: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getSprintById(input.id)),
    create: protectedProcedure.input(z.object({
      clientId: z.number(),
      name: z.string().min(1),
      weekNumber: z.number(),
      status: z.enum(["planned", "in_progress", "completed"]).optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      notes: z.string().optional(),
    })).mutation(({ input }) => db.createSprint(input)),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      status: z.enum(["planned", "in_progress", "completed"]).optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      notes: z.string().optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return db.updateSprint(id, data); }),
    createFullSprint: protectedProcedure.input(z.object({
      clientId: z.number(),
      startDate: z.date(),
    })).mutation(async ({ input }) => {
      const sprintTemplates = [
        { week: 1, name: "Diagnóstico e Blueprint", tasks: [
          "Reunião inicial com decisor e coordenadores (90 min)",
          "Mapeamento do caminho do cliente",
          "Construção do playbook: scripts, qualificação, objeções",
          "Definição do funil e padrão de registro (CRM)",
          "Definição de KPIs e metas diárias/semanais",
          "Coleta de evidências e histórico",
        ]},
        { week: 2, name: "Execução Guiada e Ajustes", tasks: [
          "Início da operação com registro obrigatório",
          "Testes A/B de abordagem",
          "Correções diárias: linguagem, oferta, objeções",
          "Implantação de SLA de resposta",
          "Primeiro relatório semanal",
        ]},
        { week: 3, name: "Estabilização e Previsibilidade", tasks: [
          "Consolidação do script campeão",
          "Aumento da taxa de conversão (follow-up, recuperação)",
          "Organização do funil para previsibilidade",
          "Ajustes finos em preço e proposta",
          "Segundo relatório semanal",
        ]},
        { week: 4, name: "Transferência e Continuidade", tasks: [
          "Padronização final: playbook, scripts, checklists",
          "Treinamento prático com simulações",
          "Documento de governança",
          "Relatório final do sprint",
          "Definição do próximo ciclo",
        ]},
      ];

      const results = [];
      for (const template of sprintTemplates) {
        const startDate = new Date(input.startDate);
        startDate.setDate(startDate.getDate() + (template.week - 1) * 7);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);

        const sprint = await db.createSprint({
          clientId: input.clientId,
          name: `Semana ${template.week} - ${template.name}`,
          weekNumber: template.week,
          startDate,
          endDate,
        });

        for (let i = 0; i < template.tasks.length; i++) {
          await db.createSprintTask({
            sprintId: sprint.id,
            title: template.tasks[i],
            weekNumber: template.week,
            order: i + 1,
          });
        }
        results.push(sprint);
      }
      return results;
    }),
  }),

  sprintTasks: router({
    bySprint: protectedProcedure.input(z.object({ sprintId: z.number() })).query(({ input }) => db.getTasksBySprint(input.sprintId)),
    create: protectedProcedure.input(z.object({
      sprintId: z.number(),
      title: z.string().min(1),
      description: z.string().optional(),
      weekNumber: z.number(),
      assignedUserId: z.number().optional(),
      dueDate: z.date().optional(),
      order: z.number().optional(),
    })).mutation(({ input }) => db.createSprintTask(input)),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      isCompleted: z.boolean().optional(),
      assignedUserId: z.number().optional(),
      dueDate: z.date().optional(),
      completedAt: z.date().optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return db.updateSprintTask(id, data); }),
    toggleComplete: protectedProcedure.input(z.object({ id: z.number(), isCompleted: z.boolean() })).mutation(({ input }) =>
      db.updateSprintTask(input.id, { isCompleted: input.isCompleted, completedAt: input.isCompleted ? new Date() : undefined })
    ),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteSprintTask(input.id)),
  }),

  playbooks: router({
    list: protectedProcedure.query(() => db.getAllPlaybooks()),
    byId: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getPlaybookById(input.id)),
    byCategory: protectedProcedure.input(z.object({ category: z.string() })).query(({ input }) => db.getPlaybooksByCategory(input.category)),
    bySegment: protectedProcedure.input(z.object({ segment: z.string() })).query(({ input }) => db.getPlaybooksBySegment(input.segment)),
    create: protectedProcedure.input(z.object({
      title: z.string().min(1),
      category: z.enum(["script", "objection_matrix", "playbook", "template", "checklist"]),
      segment: z.string().optional(),
      content: z.string().min(1),
      tags: z.string().optional(),
    })).mutation(({ input, ctx }) => db.createPlaybook({ ...input, createdByUserId: ctx.user.id })),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      category: z.enum(["script", "objection_matrix", "playbook", "template", "checklist"]).optional(),
      segment: z.string().optional(),
      content: z.string().optional(),
      tags: z.string().optional(),
      isActive: z.boolean().optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return db.updatePlaybook(id, data); }),
    delete: adminProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deletePlaybook(input.id)),
  }),

  reports: router({
    list: protectedProcedure.query(() => db.getAllReports()),
    byClient: protectedProcedure.input(z.object({ clientId: z.number() })).query(({ input }) => db.getReportsByClient(input.clientId)),
    byId: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getReportById(input.id)),
    create: protectedProcedure.input(z.object({
      clientId: z.number(),
      type: z.enum(["weekly", "monthly"]),
      title: z.string().min(1),
      periodStart: z.date(),
      periodEnd: z.date(),
      content: z.string().optional(),
      metrics: z.string().optional(),
    })).mutation(({ input, ctx }) => db.createReport({ ...input, createdByUserId: ctx.user.id })),
  }),

  notifications: router({
    list: protectedProcedure.query(({ ctx }) => db.getNotificationsByUser(ctx.user.id)),
    unread: protectedProcedure.query(({ ctx }) => db.getUnreadNotifications(ctx.user.id)),
    markRead: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.markNotificationRead(input.id)),
    markAllRead: protectedProcedure.mutation(({ ctx }) => db.markAllNotificationsRead(ctx.user.id)),
    create: protectedProcedure.input(z.object({
      userId: z.number(),
      title: z.string().min(1),
      message: z.string().optional(),
      type: z.enum(["task_due", "follow_up", "sprint_update", "lead_update", "system"]),
      linkTo: z.string().optional(),
    })).mutation(({ input }) => db.createNotification(input)),
  }),

  dashboard: router({
    kpis: protectedProcedure.input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }).optional()).query(({ input }) => db.getDashboardKPIs(input?.startDate, input?.endDate)),
  }),

  preparacao: router({
    getNote: protectedProcedure
      .input(z.object({ section: z.string() }))
      .query(({ input }) => db.getPreparacaoNote(input.section)),
    upsertNote: protectedProcedure
      .input(z.object({ section: z.string(), content: z.string() }))
      .mutation(({ input }) => db.upsertPreparacaoNote(input.section, input.content)),
  }),

  pageConfig: router({
    get: protectedProcedure
      .input(z.object({ pageKey: z.string() }))
      .query(({ input }) => db.getPageConfig(input.pageKey)),
    upsert: adminProcedure
      .input(z.object({ pageKey: z.string(), config: z.unknown() }))
      .mutation(({ input }) => db.upsertPageConfig(input.pageKey, input.config)),
    delete: adminProcedure
      .input(z.object({ pageKey: z.string() }))
      .mutation(({ input }) => db.deletePageConfig(input.pageKey)),
  }),
});

export type AppRouter = typeof appRouter;
