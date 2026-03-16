import { eq, desc, and, sql, gte, lte, count, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  clients, InsertClient,
  funnels, InsertFunnel,
  funnelStages, InsertFunnelStage,
  leads, InsertLead,
  interactions, InsertInteraction,
  sprints, InsertSprint,
  sprintTasks, InsertSprintTask,
  playbooks, InsertPlaybook,
  reports, InsertReport,
  notifications, InsertNotification,
  clientPortalAccess, InsertClientPortalAccess,
  clientTickets, InsertClientTicket,
  ticketMessages, InsertTicketMessage,
  sharedDocuments, InsertSharedDocument,
  projectUpdates, InsertProjectUpdate,
  financeCategories, InsertFinanceCategory,
  financeTransactions, InsertFinanceTransaction,
  invoices, InsertInvoice,
  invoiceItems, InsertInvoiceItem,
  bankAccounts, InsertBankAccount,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

type MemoryRow<T extends object> = T & { id: number };

type MemoryUser = {
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: "user" | "admin";
  avatarUrl: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
};

const memoryStore = {
  users: [] as MemoryRow<MemoryUser>[],
  clients: [] as MemoryRow<InsertClient & { status: "prospect" | "active" | "paused" | "churned"; createdAt: Date; updatedAt: Date }>[],
  funnels: [] as MemoryRow<InsertFunnel & { isActive: boolean; createdAt: Date; updatedAt: Date }>[],
  funnelStages: [] as MemoryRow<InsertFunnelStage & { color: string | null; createdAt: Date }>[],
  leads: [] as MemoryRow<InsertLead & { status: "open" | "won" | "lost"; createdAt: Date; updatedAt: Date }>[],
  interactions: [] as MemoryRow<InsertInteraction & { createdAt: Date }>[],
  sprints: [] as MemoryRow<InsertSprint & { status: "planned" | "in_progress" | "completed"; createdAt: Date; updatedAt: Date }>[],
  sprintTasks: [] as MemoryRow<InsertSprintTask & { isCompleted: boolean; order: number; createdAt: Date; updatedAt: Date }>[],
  playbooks: [] as MemoryRow<InsertPlaybook & { version: number; isActive: boolean; createdAt: Date; updatedAt: Date }>[],
  reports: [] as MemoryRow<InsertReport & { isSharedWithClient: boolean; createdAt: Date }>[],
  notifications: [] as MemoryRow<InsertNotification & { isRead: boolean; createdAt: Date }>[],
};

// Preparação Notes (simple key-value, not in DB schema, in-memory only)
const preparacaoNotesStore: Record<string, { content: string; updatedAt: Date }> = {};
const pageConfigsStore: Record<string, { config: unknown; updatedAt: Date }> = {};

export async function getPreparacaoNote(section: string) {
  return preparacaoNotesStore[section] ?? null;
}

export async function upsertPreparacaoNote(section: string, content: string) {
  preparacaoNotesStore[section] = { content, updatedAt: new Date() };
  return preparacaoNotesStore[section];
}

export async function getPageConfig(pageKey: string) {
  return pageConfigsStore[pageKey] ?? null;
}

export async function upsertPageConfig(pageKey: string, config: unknown) {
  pageConfigsStore[pageKey] = { config, updatedAt: new Date() };
  return pageConfigsStore[pageKey];
}

export async function deletePageConfig(pageKey: string) {
  delete pageConfigsStore[pageKey];
  return { success: true } as const;
}

const memoryIds = {
  users: 1,
  clients: 1,
  funnels: 1,
  funnelStages: 1,
  leads: 1,
  interactions: 1,
  sprints: 1,
  sprintTasks: 1,
  playbooks: 1,
  reports: 1,
  notifications: 1,
} as const;

type MemoryEntity = keyof typeof memoryIds;

function nextMemoryId(entity: MemoryEntity): number {
  const id = memoryIds[entity];
  (memoryIds as Record<MemoryEntity, number>)[entity] += 1;
  return id;
}

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    const now = new Date();
    const idx = memoryStore.users.findIndex(existing => existing.openId === user.openId);
    const normalizedRole = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");

    if (idx >= 0) {
      memoryStore.users[idx] = {
        ...memoryStore.users[idx],
        ...user,
        role: normalizedRole,
        updatedAt: now,
        lastSignedIn: user.lastSignedIn ?? now,
      };
      return;
    }

    memoryStore.users.push({
      id: nextMemoryId("users"),
      openId: user.openId,
      name: user.name ?? null,
      email: user.email ?? null,
      loginMethod: user.loginMethod ?? null,
      role: normalizedRole,
      avatarUrl: user.avatarUrl ?? null,
      phone: user.phone ?? null,
      createdAt: now,
      updatedAt: now,
      lastSignedIn: user.lastSignedIn ?? now,
    });
    return;
  }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => { const value = user[field]; if (value === undefined) return; const normalized = value ?? null; values[field] = normalized; updateSet[field] = normalized; };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return memoryStore.users.find(user => user.openId === openId);
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [...memoryStore.users].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return db.select().from(users).orderBy(desc(users.createdAt));
}

// ─── Clients ─────────────────────────────────────────────────────────
export async function createClient(data: InsertClient) {
  const db = await getDb();
  if (!db) {
    const now = new Date();
    const row: (typeof memoryStore.clients)[number] = {
      id: nextMemoryId("clients"),
      ...data,
      status: data.status ?? "prospect",
      createdAt: now,
      updatedAt: now,
    };
    memoryStore.clients.push(row);
    return { id: row.id };
  }
  const result = await db.insert(clients).values(data);
  return { id: result[0].insertId };
}
export async function updateClient(id: number, data: Partial<InsertClient>) {
  const db = await getDb();
  if (!db) {
    const idx = memoryStore.clients.findIndex(client => client.id === id);
    if (idx >= 0) memoryStore.clients[idx] = { ...memoryStore.clients[idx], ...data, updatedAt: new Date() };
    return;
  }
  await db.update(clients).set(data).where(eq(clients.id, id));
}
export async function deleteClient(id: number) {
  const db = await getDb();
  if (!db) {
    memoryStore.clients = memoryStore.clients.filter(client => client.id !== id);
    return;
  }
  await db.delete(clients).where(eq(clients.id, id));
}
export async function getClientById(id: number) {
  const db = await getDb();
  if (!db) return memoryStore.clients.find(client => client.id === id);
  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result[0];
}
export async function getAllClients() {
  const db = await getDb();
  if (!db) return [...memoryStore.clients].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return db.select().from(clients).orderBy(desc(clients.createdAt));
}
export async function getClientsByStatus(status: string) {
  const db = await getDb();
  if (!db) return memoryStore.clients.filter(client => client.status === status as any).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return db.select().from(clients).where(eq(clients.status, status as any)).orderBy(desc(clients.createdAt));
}

// ─── Funnels ─────────────────────────────────────────────────────────
export async function createFunnel(data: InsertFunnel) {
  const db = await getDb();
  if (!db) {
    const now = new Date();
    const row: (typeof memoryStore.funnels)[number] = {
      id: nextMemoryId("funnels"),
      ...data,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    memoryStore.funnels.push(row);
    return { id: row.id };
  }
  const result = await db.insert(funnels).values(data);
  return { id: result[0].insertId };
}
export async function getFunnelsByClient(clientId: number) {
  const db = await getDb();
  if (!db) return memoryStore.funnels.filter(funnel => funnel.clientId === clientId);
  return db.select().from(funnels).where(eq(funnels.clientId, clientId));
}
export async function getFunnelById(id: number) {
  const db = await getDb();
  if (!db) return memoryStore.funnels.find(funnel => funnel.id === id);
  const result = await db.select().from(funnels).where(eq(funnels.id, id)).limit(1);
  return result[0];
}
export async function getAllFunnels() {
  const db = await getDb();
  if (!db) return [...memoryStore.funnels].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return db.select().from(funnels).orderBy(desc(funnels.createdAt));
}
export async function deleteFunnel(id: number) {
  const db = await getDb();
  if (!db) {
    memoryStore.funnelStages = memoryStore.funnelStages.filter(stage => stage.funnelId !== id);
    memoryStore.leads = memoryStore.leads.filter(lead => lead.funnelId !== id);
    memoryStore.funnels = memoryStore.funnels.filter(funnel => funnel.id !== id);
    return;
  }
  await db.delete(funnelStages).where(eq(funnelStages.funnelId, id));
  await db.delete(funnels).where(eq(funnels.id, id));
}

// ─── Funnel Stages ───────────────────────────────────────────────────
export async function createFunnelStage(data: InsertFunnelStage) {
  const db = await getDb();
  if (!db) {
    const row: (typeof memoryStore.funnelStages)[number] = {
      id: nextMemoryId("funnelStages"),
      ...data,
      color: data.color ?? "#8B5CF6",
      createdAt: new Date(),
    };
    memoryStore.funnelStages.push(row);
    return { id: row.id };
  }
  const result = await db.insert(funnelStages).values(data);
  return { id: result[0].insertId };
}
export async function getStagesByFunnel(funnelId: number) {
  const db = await getDb();
  if (!db) return memoryStore.funnelStages.filter(stage => stage.funnelId === funnelId).sort((a, b) => a.order - b.order);
  return db.select().from(funnelStages).where(eq(funnelStages.funnelId, funnelId)).orderBy(funnelStages.order);
}
export async function updateFunnelStage(id: number, data: Partial<InsertFunnelStage>) {
  const db = await getDb();
  if (!db) {
    const idx = memoryStore.funnelStages.findIndex(stage => stage.id === id);
    if (idx >= 0) memoryStore.funnelStages[idx] = { ...memoryStore.funnelStages[idx], ...data };
    return;
  }
  await db.update(funnelStages).set(data).where(eq(funnelStages.id, id));
}
export async function deleteFunnelStage(id: number) {
  const db = await getDb();
  if (!db) {
    memoryStore.funnelStages = memoryStore.funnelStages.filter(stage => stage.id !== id);
    return;
  }
  await db.delete(funnelStages).where(eq(funnelStages.id, id));
}

// ─── Leads ───────────────────────────────────────────────────────────
export async function createLead(data: InsertLead) {
  const db = await getDb();
  if (!db) {
    const now = new Date();
    const row: (typeof memoryStore.leads)[number] = {
      id: nextMemoryId("leads"),
      ...data,
      status: data.status ?? "open",
      createdAt: now,
      updatedAt: now,
    };
    memoryStore.leads.push(row);
    return { id: row.id };
  }
  const result = await db.insert(leads).values(data);
  return { id: result[0].insertId };
}
export async function updateLead(id: number, data: Partial<InsertLead>) {
  const db = await getDb();
  if (!db) {
    const idx = memoryStore.leads.findIndex(lead => lead.id === id);
    if (idx >= 0) memoryStore.leads[idx] = { ...memoryStore.leads[idx], ...data, updatedAt: new Date() };
    return;
  }
  await db.update(leads).set(data).where(eq(leads.id, id));
}
export async function deleteLead(id: number) {
  const db = await getDb();
  if (!db) {
    memoryStore.leads = memoryStore.leads.filter(lead => lead.id !== id);
    return;
  }
  await db.delete(leads).where(eq(leads.id, id));
}
export async function getLeadById(id: number) {
  const db = await getDb();
  if (!db) return memoryStore.leads.find(lead => lead.id === id);
  const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return result[0];
}
export async function getLeadsByFunnel(funnelId: number) {
  const db = await getDb();
  if (!db) return memoryStore.leads.filter(lead => lead.funnelId === funnelId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return db.select().from(leads).where(eq(leads.funnelId, funnelId)).orderBy(desc(leads.createdAt));
}
export async function getLeadsByStage(stageId: number) {
  const db = await getDb();
  if (!db) return memoryStore.leads.filter(lead => lead.stageId === stageId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return db.select().from(leads).where(eq(leads.stageId, stageId)).orderBy(desc(leads.createdAt));
}
export async function getLeadsByClient(clientId: number) {
  const db = await getDb();
  if (!db) return memoryStore.leads.filter(lead => lead.clientId === clientId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return db.select().from(leads).where(eq(leads.clientId, clientId)).orderBy(desc(leads.createdAt));
}
export async function getAllLeads() {
  const db = await getDb();
  if (!db) return [...memoryStore.leads].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return db.select().from(leads).orderBy(desc(leads.createdAt));
}

// ─── Interactions ────────────────────────────────────────────────────
export async function createInteraction(data: InsertInteraction) {
  const db = await getDb();
  if (!db) {
    const row: (typeof memoryStore.interactions)[number] = {
      id: nextMemoryId("interactions"),
      ...data,
      createdAt: new Date(),
    };
    memoryStore.interactions.push(row);
    return { id: row.id };
  }
  const result = await db.insert(interactions).values(data);
  return { id: result[0].insertId };
}
export async function getInteractionsByLead(leadId: number) {
  const db = await getDb();
  if (!db) return memoryStore.interactions.filter(interaction => interaction.leadId === leadId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return db.select().from(interactions).where(eq(interactions.leadId, leadId)).orderBy(desc(interactions.createdAt));
}
export async function getInteractionsByClient(clientId: number) {
  const db = await getDb();
  if (!db) return memoryStore.interactions.filter(interaction => interaction.clientId === clientId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return db.select().from(interactions).where(eq(interactions.clientId, clientId)).orderBy(desc(interactions.createdAt));
}
export async function getAllInteractions() {
  const db = await getDb();
  if (!db) return [...memoryStore.interactions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return db.select().from(interactions).orderBy(desc(interactions.createdAt));
}

// ─── Sprints ─────────────────────────────────────────────────────────
export async function createSprint(data: InsertSprint) {
  const db = await getDb();
  if (!db) {
    const now = new Date();
    const row: (typeof memoryStore.sprints)[number] = {
      id: nextMemoryId("sprints"),
      ...data,
      status: data.status ?? "planned",
      createdAt: now,
      updatedAt: now,
    };
    memoryStore.sprints.push(row);
    return { id: row.id };
  }
  const result = await db.insert(sprints).values(data);
  return { id: result[0].insertId };
}
export async function updateSprint(id: number, data: Partial<InsertSprint>) {
  const db = await getDb();
  if (!db) {
    const idx = memoryStore.sprints.findIndex(sprint => sprint.id === id);
    if (idx >= 0) memoryStore.sprints[idx] = { ...memoryStore.sprints[idx], ...data, updatedAt: new Date() };
    return;
  }
  await db.update(sprints).set(data).where(eq(sprints.id, id));
}
export async function getSprintsByClient(clientId: number) {
  const db = await getDb();
  if (!db) return memoryStore.sprints.filter(sprint => sprint.clientId === clientId).sort((a, b) => a.weekNumber - b.weekNumber);
  return db.select().from(sprints).where(eq(sprints.clientId, clientId)).orderBy(sprints.weekNumber);
}
export async function getSprintById(id: number) {
  const db = await getDb();
  if (!db) return memoryStore.sprints.find(sprint => sprint.id === id);
  const result = await db.select().from(sprints).where(eq(sprints.id, id)).limit(1);
  return result[0];
}
export async function getAllSprints() {
  const db = await getDb();
  if (!db) return [...memoryStore.sprints].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return db.select().from(sprints).orderBy(desc(sprints.createdAt));
}

// ─── Sprint Tasks ────────────────────────────────────────────────────
export async function createSprintTask(data: InsertSprintTask) {
  const db = await getDb();
  if (!db) {
    const now = new Date();
    const row: (typeof memoryStore.sprintTasks)[number] = {
      id: nextMemoryId("sprintTasks"),
      ...data,
      isCompleted: data.isCompleted ?? false,
      order: data.order ?? 0,
      createdAt: now,
      updatedAt: now,
    };
    memoryStore.sprintTasks.push(row);
    return { id: row.id };
  }
  const result = await db.insert(sprintTasks).values(data);
  return { id: result[0].insertId };
}
export async function updateSprintTask(id: number, data: Partial<InsertSprintTask>) {
  const db = await getDb();
  if (!db) {
    const idx = memoryStore.sprintTasks.findIndex(task => task.id === id);
    if (idx >= 0) memoryStore.sprintTasks[idx] = { ...memoryStore.sprintTasks[idx], ...data, updatedAt: new Date() };
    return;
  }
  await db.update(sprintTasks).set(data).where(eq(sprintTasks.id, id));
}
export async function getTasksBySprint(sprintId: number) {
  const db = await getDb();
  if (!db) {
    return memoryStore.sprintTasks
      .filter(task => task.sprintId === sprintId)
      .sort((a, b) => a.weekNumber - b.weekNumber || a.order - b.order);
  }
  return db.select().from(sprintTasks).where(eq(sprintTasks.sprintId, sprintId)).orderBy(sprintTasks.weekNumber, sprintTasks.order);
}
export async function deleteSprintTask(id: number) {
  const db = await getDb();
  if (!db) {
    memoryStore.sprintTasks = memoryStore.sprintTasks.filter(task => task.id !== id);
    return;
  }
  await db.delete(sprintTasks).where(eq(sprintTasks.id, id));
}

// ─── Playbooks ───────────────────────────────────────────────────────
export async function createPlaybook(data: InsertPlaybook) {
  const db = await getDb();
  if (!db) {
    const now = new Date();
    const row: (typeof memoryStore.playbooks)[number] = {
      id: nextMemoryId("playbooks"),
      ...data,
      version: data.version ?? 1,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };
    memoryStore.playbooks.push(row);
    return { id: row.id };
  }
  const result = await db.insert(playbooks).values(data);
  return { id: result[0].insertId };
}
export async function updatePlaybook(id: number, data: Partial<InsertPlaybook>) {
  const db = await getDb();
  if (!db) {
    const idx = memoryStore.playbooks.findIndex(playbook => playbook.id === id);
    if (idx >= 0) memoryStore.playbooks[idx] = { ...memoryStore.playbooks[idx], ...data, updatedAt: new Date() };
    return;
  }
  await db.update(playbooks).set(data).where(eq(playbooks.id, id));
}
export async function deletePlaybook(id: number) {
  const db = await getDb();
  if (!db) {
    memoryStore.playbooks = memoryStore.playbooks.filter(playbook => playbook.id !== id);
    return;
  }
  await db.delete(playbooks).where(eq(playbooks.id, id));
}
export async function getPlaybookById(id: number) {
  const db = await getDb();
  if (!db) return memoryStore.playbooks.find(playbook => playbook.id === id);
  const result = await db.select().from(playbooks).where(eq(playbooks.id, id)).limit(1);
  return result[0];
}
export async function getAllPlaybooks() {
  const db = await getDb();
  if (!db) return memoryStore.playbooks.filter(playbook => playbook.isActive).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  return db.select().from(playbooks).where(eq(playbooks.isActive, true)).orderBy(desc(playbooks.updatedAt));
}
export async function getPlaybooksByCategory(category: string) {
  const db = await getDb();
  if (!db) return memoryStore.playbooks.filter(playbook => playbook.category === category as any && playbook.isActive).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  return db.select().from(playbooks).where(and(eq(playbooks.category, category as any), eq(playbooks.isActive, true))).orderBy(desc(playbooks.updatedAt));
}
export async function getPlaybooksBySegment(segment: string) {
  const db = await getDb();
  if (!db) return memoryStore.playbooks.filter(playbook => playbook.segment === segment && playbook.isActive).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  return db.select().from(playbooks).where(and(eq(playbooks.segment, segment), eq(playbooks.isActive, true))).orderBy(desc(playbooks.updatedAt));
}

// ─── Reports ─────────────────────────────────────────────────────────
export async function createReport(data: InsertReport) {
  const db = await getDb();
  if (!db) {
    const row: (typeof memoryStore.reports)[number] = {
      id: nextMemoryId("reports"),
      ...data,
      isSharedWithClient: data.isSharedWithClient ?? false,
      createdAt: new Date(),
    };
    memoryStore.reports.push(row);
    return { id: row.id };
  }
  const result = await db.insert(reports).values(data);
  return { id: result[0].insertId };
}
export async function getReportsByClient(clientId: number) {
  const db = await getDb();
  if (!db) return memoryStore.reports.filter(report => report.clientId === clientId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return db.select().from(reports).where(eq(reports.clientId, clientId)).orderBy(desc(reports.createdAt));
}
export async function getReportById(id: number) {
  const db = await getDb();
  if (!db) return memoryStore.reports.find(report => report.id === id);
  const result = await db.select().from(reports).where(eq(reports.id, id)).limit(1);
  return result[0];
}
export async function getAllReports() {
  const db = await getDb();
  if (!db) return [...memoryStore.reports].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return db.select().from(reports).orderBy(desc(reports.createdAt));
}
export async function getSharedReports(clientId: number) {
  const db = await getDb();
  if (!db) return memoryStore.reports.filter(report => report.clientId === clientId && report.isSharedWithClient).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return db.select().from(reports).where(and(eq(reports.clientId, clientId), eq(reports.isSharedWithClient, true))).orderBy(desc(reports.createdAt));
}
export async function toggleReportSharing(id: number, isShared: boolean) {
  const db = await getDb();
  if (!db) {
    const idx = memoryStore.reports.findIndex(report => report.id === id);
    if (idx >= 0) memoryStore.reports[idx] = { ...memoryStore.reports[idx], isSharedWithClient: isShared };
    return;
  }
  await db.update(reports).set({ isSharedWithClient: isShared }).where(eq(reports.id, id));
}

// ─── Notifications ──────────────────────────────────────────────────
export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) {
    const row: (typeof memoryStore.notifications)[number] = {
      id: nextMemoryId("notifications"),
      ...data,
      isRead: data.isRead ?? false,
      createdAt: new Date(),
    };
    memoryStore.notifications.push(row);
    return { id: row.id };
  }
  const result = await db.insert(notifications).values(data);
  return { id: result[0].insertId };
}
export async function getNotificationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return memoryStore.notifications.filter(notification => notification.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
}
export async function getUnreadNotifications(userId: number) {
  const db = await getDb();
  if (!db) return memoryStore.notifications.filter(notification => notification.userId === userId && !notification.isRead).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return db.select().from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.isRead, false))).orderBy(desc(notifications.createdAt));
}
export async function markNotificationRead(id: number) {
  const db = await getDb();
  if (!db) {
    const idx = memoryStore.notifications.findIndex(notification => notification.id === id);
    if (idx >= 0) memoryStore.notifications[idx] = { ...memoryStore.notifications[idx], isRead: true };
    return;
  }
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}
export async function markAllNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) {
    memoryStore.notifications = memoryStore.notifications.map(notification =>
      notification.userId === userId ? { ...notification, isRead: true } : notification
    );
    return;
  }
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
}

// ─── Dashboard KPIs ──────────────────────────────────────────────────
export async function getDashboardKPIs(startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return { totalClients: 0, activeClients: 0, totalLeads: 0, openLeads: 0, wonLeads: 0, lostLeads: 0, totalInteractions: 0, pendingTasks: 0 };
  const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const end = endDate || new Date();
  const [clientCount] = await db.select({ count: count() }).from(clients);
  const [activeClientCount] = await db.select({ count: count() }).from(clients).where(eq(clients.status, "active"));
  const [leadCount] = await db.select({ count: count() }).from(leads).where(gte(leads.createdAt, start));
  const [openLeadCount] = await db.select({ count: count() }).from(leads).where(eq(leads.status, "open"));
  const [wonLeadCount] = await db.select({ count: count() }).from(leads).where(and(eq(leads.status, "won"), gte(leads.closedAt, start)));
  const [lostLeadCount] = await db.select({ count: count() }).from(leads).where(and(eq(leads.status, "lost"), gte(leads.closedAt, start)));
  const [interactionCount] = await db.select({ count: count() }).from(interactions).where(gte(interactions.createdAt, start));
  const [pendingTaskCount] = await db.select({ count: count() }).from(sprintTasks).where(eq(sprintTasks.isCompleted, false));
  return {
    totalClients: clientCount.count, activeClients: activeClientCount.count,
    totalLeads: leadCount.count, openLeads: openLeadCount.count,
    wonLeads: wonLeadCount.count, lostLeads: lostLeadCount.count,
    totalInteractions: interactionCount.count, pendingTasks: pendingTaskCount.count,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// ─── CLIENT PORTAL ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

// Portal Access
export async function createPortalAccess(data: InsertClientPortalAccess) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(clientPortalAccess).values(data);
  return { id: result[0].insertId };
}
export async function getPortalAccessByUser(userId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(clientPortalAccess).where(and(eq(clientPortalAccess.userId, userId), eq(clientPortalAccess.isActive, true)));
}
export async function getPortalAccessByClient(clientId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(clientPortalAccess).where(and(eq(clientPortalAccess.clientId, clientId), eq(clientPortalAccess.isActive, true)));
}

// Tickets
export async function createTicket(data: InsertClientTicket) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(clientTickets).values(data);
  return { id: result[0].insertId };
}
export async function updateTicket(id: number, data: Partial<InsertClientTicket>) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.update(clientTickets).set(data).where(eq(clientTickets.id, id));
}
export async function getTicketById(id: number) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(clientTickets).where(eq(clientTickets.id, id)).limit(1);
  return result[0];
}
export async function getTicketsByClient(clientId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(clientTickets).where(eq(clientTickets.clientId, clientId)).orderBy(desc(clientTickets.createdAt));
}
export async function getAllTickets() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(clientTickets).orderBy(desc(clientTickets.createdAt));
}

// Ticket Messages
export async function createTicketMessage(data: InsertTicketMessage) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(ticketMessages).values(data);
  return { id: result[0].insertId };
}
export async function getMessagesByTicket(ticketId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(ticketMessages).where(eq(ticketMessages.ticketId, ticketId)).orderBy(ticketMessages.createdAt);
}

// Shared Documents
export async function createSharedDocument(data: InsertSharedDocument) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(sharedDocuments).values(data);
  return { id: result[0].insertId };
}
export async function getDocumentsByClient(clientId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(sharedDocuments).where(eq(sharedDocuments.clientId, clientId)).orderBy(desc(sharedDocuments.createdAt));
}
export async function deleteSharedDocument(id: number) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.delete(sharedDocuments).where(eq(sharedDocuments.id, id));
}

// Project Updates
export async function createProjectUpdate(data: InsertProjectUpdate) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(projectUpdates).values(data);
  return { id: result[0].insertId };
}
export async function getUpdatesByClient(clientId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(projectUpdates).where(eq(projectUpdates.clientId, clientId)).orderBy(desc(projectUpdates.createdAt));
}

// ═══════════════════════════════════════════════════════════════════════
// ─── WAYZEN FINANCE ────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

// Categories
export async function createFinanceCategory(data: InsertFinanceCategory) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(financeCategories).values(data);
  return { id: result[0].insertId };
}
export async function getAllFinanceCategories() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(financeCategories).orderBy(financeCategories.name);
}
export async function deleteFinanceCategory(id: number) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.delete(financeCategories).where(eq(financeCategories.id, id));
}

// Transactions
export async function createTransaction(data: InsertFinanceTransaction) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(financeTransactions).values(data);
  return { id: result[0].insertId };
}
export async function updateTransaction(id: number, data: Partial<InsertFinanceTransaction>) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.update(financeTransactions).set(data).where(eq(financeTransactions.id, id));
}
export async function deleteTransaction(id: number) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.delete(financeTransactions).where(eq(financeTransactions.id, id));
}
export async function getTransactionById(id: number) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(financeTransactions).where(eq(financeTransactions.id, id)).limit(1);
  return result[0];
}
export async function getAllTransactions() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(financeTransactions).orderBy(desc(financeTransactions.date));
}
export async function getTransactionsByType(type: string) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(financeTransactions).where(eq(financeTransactions.type, type as any)).orderBy(desc(financeTransactions.date));
}
export async function getTransactionsByClient(clientId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(financeTransactions).where(eq(financeTransactions.clientId, clientId)).orderBy(desc(financeTransactions.date));
}

// Invoices
export async function createInvoice(data: InsertInvoice) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(invoices).values(data);
  return { id: result[0].insertId };
}
export async function updateInvoice(id: number, data: Partial<InsertInvoice>) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.update(invoices).set(data).where(eq(invoices.id, id));
}
export async function getInvoiceById(id: number) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  return result[0];
}
export async function getAllInvoices() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(invoices).orderBy(desc(invoices.createdAt));
}
export async function getInvoicesByClient(clientId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(invoices).where(eq(invoices.clientId, clientId)).orderBy(desc(invoices.createdAt));
}

// Invoice Items
export async function createInvoiceItem(data: InsertInvoiceItem) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(invoiceItems).values(data);
  return { id: result[0].insertId };
}
export async function getItemsByInvoice(invoiceId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
}
export async function deleteInvoiceItem(id: number) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.delete(invoiceItems).where(eq(invoiceItems.id, id));
}

// Bank Accounts
export async function createBankAccount(data: InsertBankAccount) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  const result = await db.insert(bankAccounts).values(data);
  return { id: result[0].insertId };
}
export async function updateBankAccount(id: number, data: Partial<InsertBankAccount>) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.update(bankAccounts).set(data).where(eq(bankAccounts.id, id));
}
export async function getAllBankAccounts() {
  const db = await getDb(); if (!db) return [];
  return db.select().from(bankAccounts).where(eq(bankAccounts.isActive, true)).orderBy(bankAccounts.name);
}
export async function deleteBankAccount(id: number) {
  const db = await getDb(); if (!db) throw new Error("DB not available");
  await db.update(bankAccounts).set({ isActive: false }).where(eq(bankAccounts.id, id));
}

// Finance Dashboard KPIs
export async function getFinanceDashboardKPIs(startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return { totalRevenue: 0, totalExpenses: 0, netBalance: 0, pendingReceivables: 0, overduePayments: 0, invoicesPending: 0, invoicesPaid: 0 };
  const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const end = endDate || new Date();

  const [revResult] = await db.select({ total: sum(financeTransactions.amount) }).from(financeTransactions)
    .where(and(eq(financeTransactions.type, "revenue"), eq(financeTransactions.status, "paid"), gte(financeTransactions.date, start), lte(financeTransactions.date, end)));
  const [expResult] = await db.select({ total: sum(financeTransactions.amount) }).from(financeTransactions)
    .where(and(eq(financeTransactions.type, "expense"), eq(financeTransactions.status, "paid"), gte(financeTransactions.date, start), lte(financeTransactions.date, end)));
  const [pendingRev] = await db.select({ total: sum(financeTransactions.amount) }).from(financeTransactions)
    .where(and(eq(financeTransactions.type, "revenue"), eq(financeTransactions.status, "pending")));
  const [overdueExp] = await db.select({ count: count() }).from(financeTransactions)
    .where(eq(financeTransactions.status, "overdue"));
  const [invPending] = await db.select({ count: count() }).from(invoices)
    .where(eq(invoices.status, "sent"));
  const [invPaid] = await db.select({ count: count() }).from(invoices)
    .where(and(eq(invoices.status, "paid"), gte(invoices.paidAt, start)));

  const totalRevenue = Number(revResult.total || 0);
  const totalExpenses = Number(expResult.total || 0);

  return {
    totalRevenue, totalExpenses,
    netBalance: totalRevenue - totalExpenses,
    pendingReceivables: Number(pendingRev.total || 0),
    overduePayments: overdueExp.count,
    invoicesPending: invPending.count,
    invoicesPaid: invPaid.count,
  };
}
