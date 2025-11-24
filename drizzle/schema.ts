import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Requirements table - stores the base data from CSV
export const requirements = mysqlTable("requirements", {
  id: int("id").autoincrement().primaryKey(),
  eixo: varchar("eixo", { length: 100 }).notNull(),
  item: text("item").notNull(),
  requisito: text("requisito").notNull(),
  descricao: text("descricao"),
  setorExecutor: varchar("setor_executor", { length: 200 }).notNull(),
  coordenadorExecutivo: varchar("coordenador_executivo", { length: 200 }),
  deadline: varchar("deadline", { length: 50 }),
  pontosAplicaveis2026: int("pontos_aplicaveis_2026").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Requirement = typeof requirements.$inferSelect;
export type InsertRequirement = typeof requirements.$inferInsert;

// Requirement updates table - stores user updates (status, evidence, notes)
export const requirementUpdates = mysqlTable("requirement_updates", {
  id: int("id").autoincrement().primaryKey(),
  requirementId: int("requirement_id").notNull(),
  status: mysqlEnum("status", ["pendente", "em_andamento", "concluido"]).default("pendente").notNull(),
  linkEvidencia: text("link_evidencia"),
  observacoes: text("observacoes"),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RequirementUpdate = typeof requirementUpdates.$inferSelect;
export type InsertRequirementUpdate = typeof requirementUpdates.$inferInsert;