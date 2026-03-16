import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, decimal } from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  avatarUrl: text("avatarUrl"),
  phone: varchar("phone", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Clients (empresas clientes da Wayzen) ───────────────────────────
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  tradeName: varchar("tradeName", { length: 255 }),
  cnpj: varchar("cnpj", { length: 20 }),
  segment: varchar("segment", { length: 100 }),
  contactName: varchar("contactName", { length: 255 }).notNull(),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 32 }),
  contactRole: varchar("contactRole", { length: 100 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  status: mysqlEnum("status", ["prospect", "active", "paused", "churned"]).default("prospect").notNull(),
  notes: text("notes"),
  assignedUserId: int("assignedUserId"),
  monthlyFee: int("monthlyFee"),
  loaPercentage: int("loaPercentage"),
  contractStartDate: timestamp("contractStartDate"),
  contractEndDate: timestamp("contractEndDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// ─── Funnels (funis comerciais por cliente) ──────────────────────────
export const funnels = mysqlTable("funnels", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Funnel = typeof funnels.$inferSelect;
export type InsertFunnel = typeof funnels.$inferInsert;

// ─── Funnel Stages (etapas configuráveis do funil) ───────────────────
export const funnelStages = mysqlTable("funnel_stages", {
  id: int("id").autoincrement().primaryKey(),
  funnelId: int("funnelId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  order: int("order").notNull(),
  color: varchar("color", { length: 7 }).default("#8B5CF6"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FunnelStage = typeof funnelStages.$inferSelect;
export type InsertFunnelStage = typeof funnelStages.$inferInsert;

// ─── Leads ───────────────────────────────────────────────────────────
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  funnelId: int("funnelId").notNull(),
  stageId: int("stageId").notNull(),
  clientId: int("clientId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  company: varchar("company", { length: 255 }),
  source: varchar("source", { length: 100 }),
  value: int("value"),
  notes: text("notes"),
  lossReason: text("lossReason"),
  assignedUserId: int("assignedUserId"),
  status: mysqlEnum("status", ["open", "won", "lost"]).default("open").notNull(),
  firstResponseAt: timestamp("firstResponseAt"),
  closedAt: timestamp("closedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// ─── Interactions (registro de interações) ───────────────────────────
export const interactions = mysqlTable("interactions", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId"),
  clientId: int("clientId"),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["email", "call", "meeting", "whatsapp", "note", "follow_up"]).notNull(),
  subject: varchar("subject", { length: 255 }),
  content: text("content"),
  scheduledAt: timestamp("scheduledAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Interaction = typeof interactions.$inferSelect;
export type InsertInteraction = typeof interactions.$inferInsert;

// ─── Sprints (sprints de 4 semanas) ──────────────────────────────────
export const sprints = mysqlTable("sprints", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  weekNumber: int("weekNumber").notNull(),
  status: mysqlEnum("status", ["planned", "in_progress", "completed"]).default("planned").notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Sprint = typeof sprints.$inferSelect;
export type InsertSprint = typeof sprints.$inferInsert;

// ─── Sprint Tasks (tarefas do sprint) ────────────────────────────────
export const sprintTasks = mysqlTable("sprint_tasks", {
  id: int("id").autoincrement().primaryKey(),
  sprintId: int("sprintId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  weekNumber: int("weekNumber").notNull(),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  assignedUserId: int("assignedUserId"),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  order: int("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SprintTask = typeof sprintTasks.$inferSelect;
export type InsertSprintTask = typeof sprintTasks.$inferInsert;

// ─── Playbooks ───────────────────────────────────────────────────────
export const playbooks = mysqlTable("playbooks", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["script", "objection_matrix", "playbook", "template", "checklist"]).notNull(),
  segment: varchar("segment", { length: 100 }),
  content: text("content").notNull(),
  tags: text("tags"),
  version: int("version").default(1).notNull(),
  createdByUserId: int("createdByUserId"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Playbook = typeof playbooks.$inferSelect;
export type InsertPlaybook = typeof playbooks.$inferInsert;

// ─── Reports (relatórios gerados) ────────────────────────────────────
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  type: mysqlEnum("type", ["weekly", "monthly"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  content: text("content"),
  metrics: text("metrics"),
  isSharedWithClient: boolean("isSharedWithClient").default(false).notNull(),
  createdByUserId: int("createdByUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

// ─── Notifications ───────────────────────────────────────────────────
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  type: mysqlEnum("type", ["task_due", "follow_up", "sprint_update", "lead_update", "system"]).notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  linkTo: varchar("linkTo", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════
// ─── CLIENT PORTAL TABLES ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

// ─── Client Portal Access (acesso do cliente ao portal) ─────────────
export const clientPortalAccess = mysqlTable("client_portal_access", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  clientId: int("clientId").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ClientPortalAccess = typeof clientPortalAccess.$inferSelect;
export type InsertClientPortalAccess = typeof clientPortalAccess.$inferInsert;

// ─── Client Tickets (tickets de suporte do cliente) ──────────────────
export const clientTickets = mysqlTable("client_tickets", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  category: varchar("category", { length: 100 }),
  assignedUserId: int("assignedUserId"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ClientTicket = typeof clientTickets.$inferSelect;
export type InsertClientTicket = typeof clientTickets.$inferInsert;

// ─── Ticket Messages (mensagens de tickets) ──────────────────────────
export const ticketMessages = mysqlTable("ticket_messages", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(),
  userId: int("userId").notNull(),
  message: text("message").notNull(),
  isInternal: boolean("isInternal").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TicketMessage = typeof ticketMessages.$inferSelect;
export type InsertTicketMessage = typeof ticketMessages.$inferInsert;

// ─── Shared Documents (documentos compartilhados com cliente) ────────
export const sharedDocuments = mysqlTable("shared_documents", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileSize: int("fileSize"),
  mimeType: varchar("mimeType", { length: 100 }),
  category: varchar("category", { length: 100 }),
  uploadedByUserId: int("uploadedByUserId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SharedDocument = typeof sharedDocuments.$inferSelect;
export type InsertSharedDocument = typeof sharedDocuments.$inferInsert;

// ─── Project Updates (atualizações de projeto para o cliente) ────────
export const projectUpdates = mysqlTable("project_updates", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["milestone", "update", "alert", "delivery"]).default("update").notNull(),
  createdByUserId: int("createdByUserId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectUpdate = typeof projectUpdates.$inferSelect;
export type InsertProjectUpdate = typeof projectUpdates.$inferInsert;

// ═══════════════════════════════════════════════════════════════════════
// ─── WAYZEN FINANCE TABLES ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════

// ─── Financial Categories (categorias financeiras) ───────────────────
export const financeCategories = mysqlTable("finance_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["revenue", "expense"]).notNull(),
  color: varchar("color", { length: 7 }).default("#8B5CF6"),
  icon: varchar("icon", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FinanceCategory = typeof financeCategories.$inferSelect;
export type InsertFinanceCategory = typeof financeCategories.$inferInsert;

// ─── Financial Transactions (receitas e despesas) ────────────────────
export const financeTransactions = mysqlTable("finance_transactions", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["revenue", "expense"]).notNull(),
  categoryId: int("categoryId"),
  clientId: int("clientId"),
  description: varchar("description", { length: 500 }).notNull(),
  amount: int("amount").notNull(), // em centavos
  date: timestamp("date").notNull(),
  dueDate: timestamp("dueDate"),
  paidAt: timestamp("paidAt"),
  status: mysqlEnum("status", ["pending", "paid", "overdue", "cancelled"]).default("pending").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  reference: varchar("reference", { length: 255 }),
  notes: text("notes"),
  recurrence: mysqlEnum("recurrence", ["none", "monthly", "quarterly", "yearly"]).default("none").notNull(),
  createdByUserId: int("createdByUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinanceTransaction = typeof financeTransactions.$inferSelect;
export type InsertFinanceTransaction = typeof financeTransactions.$inferInsert;

// ─── Invoices (faturas para clientes) ────────────────────────────────
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull(),
  description: varchar("description", { length: 500 }),
  amount: int("amount").notNull(), // em centavos
  dueDate: timestamp("dueDate").notNull(),
  paidAt: timestamp("paidAt"),
  status: mysqlEnum("status", ["draft", "sent", "paid", "overdue", "cancelled"]).default("draft").notNull(),
  notes: text("notes"),
  createdByUserId: int("createdByUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// ─── Invoice Items (itens da fatura) ─────────────────────────────────
export const invoiceItems = mysqlTable("invoice_items", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoiceId").notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  quantity: int("quantity").default(1).notNull(),
  unitPrice: int("unitPrice").notNull(), // em centavos
  total: int("total").notNull(), // em centavos
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = typeof invoiceItems.$inferInsert;

// ─── Bank Accounts (contas bancárias) ────────────────────────────────
export const bankAccounts = mysqlTable("bank_accounts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  bank: varchar("bank", { length: 100 }),
  accountType: varchar("accountType", { length: 50 }),
  balance: int("balance").default(0).notNull(), // em centavos
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = typeof bankAccounts.$inferInsert;
