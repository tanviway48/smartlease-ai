import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: varchar("clerk_id", { length: 255 }).unique().notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  fullName: varchar("full_name", { length: 255 }),
  avatarUrl: text("avatar_url"),
  plan: varchar("plan", { length: 50 }).default("free"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const leaseAnalyses = pgTable("lease_analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  fileName: varchar("file_name", { length: 500 }).notNull(),
  fileUrl: text("file_url").notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  result: jsonb("result"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rentEstimates = pgTable("rent_estimates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  locality: varchar("locality", { length: 255 }).notNull(),
  city: varchar("city", { length: 255 }).notNull(),
  bhkType: varchar("bhk_type", { length: 50 }).notNull(),
  areaSqft: integer("area_sqft"),
  estimatedMin: integer("estimated_min"),
  estimatedMax: integer("estimated_max"),
  marketRate: integer("market_rate"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type LeaseAnalysis = typeof leaseAnalyses.$inferSelect;
export type RentEstimate = typeof rentEstimates.$inferSelect;
