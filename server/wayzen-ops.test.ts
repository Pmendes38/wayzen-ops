import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "user" | "admin" = "admin"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-001",
    email: "test@wayzen.com.br",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("Wayzen Ops - Auth", () => {
  it("auth.me returns user when authenticated", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.email).toBe("test@wayzen.com.br");
    expect(result?.name).toBe("Test User");
  });

  it("auth.me returns null when not authenticated", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

describe("Wayzen Ops - Dashboard KPIs", () => {
  it("dashboard.kpis returns expected structure", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dashboard.kpis({});
    expect(result).toBeDefined();
    expect(result).toHaveProperty("totalClients");
    expect(result).toHaveProperty("activeClients");
    expect(result).toHaveProperty("totalLeads");
    expect(result).toHaveProperty("openLeads");
    expect(result).toHaveProperty("wonLeads");
    expect(result).toHaveProperty("lostLeads");
    expect(result).toHaveProperty("totalInteractions");
    expect(result).toHaveProperty("pendingTasks");
    expect(typeof result.totalClients).toBe("number");
    expect(typeof result.activeClients).toBe("number");
  });
});

describe("Wayzen Ops - Clients CRUD", () => {
  let clientId: number;

  it("creates a client", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.clients.create({
      companyName: "Escola Teste ABC",
      contactName: "João Silva",
      segment: "Educação",
      contactEmail: "joao@escolateste.com.br",
      contactPhone: "(11) 99999-0000",
      status: "prospect",
    });
    expect(result).toBeDefined();
    expect(result.id).toBeGreaterThan(0);
    clientId = result.id;
  });

  it("lists clients", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.clients.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("gets client by id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.clients.byId({ id: clientId });
    expect(result).toBeDefined();
    expect(result?.companyName).toBe("Escola Teste ABC");
  });

  it("updates a client", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    await caller.clients.update({ id: clientId, status: "active" });
    const updated = await caller.clients.byId({ id: clientId });
    expect(updated?.status).toBe("active");
  });

  it("deletes a client (admin only)", async () => {
    const ctx = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);
    await caller.clients.delete({ id: clientId });
    const deleted = await caller.clients.byId({ id: clientId });
    expect(deleted).toBeUndefined();
  });

  it("rejects delete for non-admin user", async () => {
    const ctx = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.clients.delete({ id: 999 })).rejects.toThrow();
  });
});

describe("Wayzen Ops - Funnels", () => {
  let funnelId: number;
  let clientId: number;

  it("creates a funnel with default stages", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const client = await caller.clients.create({
      companyName: "Empresa Funil Teste",
      contactName: "Maria",
    });
    clientId = client.id;

    const result = await caller.funnels.create({
      clientId: client.id,
      name: "Funil Principal",
      description: "Funil de vendas principal",
    });
    expect(result).toBeDefined();
    expect(result.id).toBeGreaterThan(0);
    funnelId = result.id;

    const stages = await caller.funnelStages.byFunnel({ funnelId: result.id });
    expect(stages.length).toBe(5);
    expect(stages[0].name).toBe("Lead");
    expect(stages[4].name).toBe("Fechado");
  });

  it("lists funnels", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.funnels.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("creates and moves a lead between stages", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const stages = await caller.funnelStages.byFunnel({ funnelId });
    const lead = await caller.leads.create({
      funnelId,
      stageId: stages[0].id,
      clientId,
      name: "Lead Teste",
      email: "lead@teste.com",
      value: 5000,
    });
    expect(lead.id).toBeGreaterThan(0);

    await caller.leads.update({ id: lead.id, stageId: stages[1].id });
    const updated = await caller.leads.byId({ id: lead.id });
    expect(updated?.stageId).toBe(stages[1].id);
  });
});

describe("Wayzen Ops - Sprints", () => {
  it("creates a full 4-week sprint", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const client = await caller.clients.create({
      companyName: "Empresa Sprint Teste",
      contactName: "Carlos",
    });

    const result = await caller.sprints.createFullSprint({
      clientId: client.id,
      startDate: new Date("2026-03-09"),
    });

    expect(result).toHaveLength(4);
    expect(result[0]).toHaveProperty("id");

    const tasks = await caller.sprintTasks.bySprint({ sprintId: result[0].id });
    expect(tasks.length).toBeGreaterThan(0);
  });

  it("toggles sprint task completion", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const sprints = await caller.sprints.list();
    expect(sprints.length).toBeGreaterThan(0);

    const tasks = await caller.sprintTasks.bySprint({ sprintId: sprints[0].id });
    expect(tasks.length).toBeGreaterThan(0);

    await caller.sprintTasks.toggleComplete({ id: tasks[0].id, isCompleted: true });
    const updatedTasks = await caller.sprintTasks.bySprint({ sprintId: sprints[0].id });
    const toggledTask = updatedTasks.find(t => t.id === tasks[0].id);
    expect(toggledTask?.isCompleted).toBe(true);
  });
});

describe("Wayzen Ops - Playbooks", () => {
  let playbookId: number;

  it("creates a playbook", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.playbooks.create({
      title: "Script de Vendas - Educação",
      category: "script",
      segment: "Educação",
      content: "## Abertura\n\nOlá, tudo bem? Meu nome é...\n\n## Qualificação\n\nQuantos alunos a escola possui?",
      tags: "vendas,educação,script",
    });
    expect(result.id).toBeGreaterThan(0);
    playbookId = result.id;
  });

  it("lists playbooks", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.playbooks.list();
    expect(result.length).toBeGreaterThan(0);
  });

  it("gets playbook by id", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.playbooks.byId({ id: playbookId });
    expect(result?.title).toBe("Script de Vendas - Educação");
    expect(result?.category).toBe("script");
  });
});

describe("Wayzen Ops - Interactions", () => {
  it("creates an interaction for a lead", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const leads = await caller.leads.list();
    if (leads.length > 0) {
      const result = await caller.interactions.create({
        leadId: leads[0].id,
        type: "call",
        subject: "Primeira ligação de qualificação",
        content: "Conversei com o decisor. Mostrou interesse no serviço.",
      });
      expect(result.id).toBeGreaterThan(0);

      const history = await caller.interactions.byLead({ leadId: leads[0].id });
      expect(history.length).toBeGreaterThan(0);
    }
  });
});

describe("Wayzen Ops - Reports", () => {
  it("creates a weekly report", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const clients = await caller.clients.list();
    if (clients.length > 0) {
      const result = await caller.reports.create({
        clientId: clients[0].id,
        type: "weekly",
        title: "Relatório Semanal - Semana 1",
        periodStart: new Date("2026-03-02"),
        periodEnd: new Date("2026-03-08"),
        content: "## Resumo\n\nSemana produtiva com 15 leads recebidos.",
        metrics: '{"leads_recebidos": 15, "propostas_enviadas": 5}',
      });
      expect(result.id).toBeGreaterThan(0);
    }
  });
});

describe("Wayzen Ops - Access Control", () => {
  it("rejects unauthenticated access to protected routes", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.clients.list()).rejects.toThrow();
  });

  it("rejects non-admin access to admin routes", async () => {
    const ctx = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);
    await expect(caller.users.list()).rejects.toThrow();
  });

  it("allows admin access to admin routes", async () => {
    const ctx = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.users.list();
    expect(Array.isArray(result)).toBe(true);
  });
});
