import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, index, doublePrecision, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Optimization results storage
export const optimizationResults = pgTable("optimization_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  region: varchar("region").notNull(),
  forecastMethod: varchar("forecast_method").notNull(),
  energyFocus: text("energy_focus").array().notNull(),
  costWeight: doublePrecision("cost_weight").notNull(),
  optimizedCost: doublePrecision("optimized_cost").notNull(),
  baselineCost: doublePrecision("baseline_cost").notNull(),
  optimizedEmissions: doublePrecision("optimized_emissions").notNull(),
  baselineEmissions: doublePrecision("baseline_emissions").notNull(),
  optimizedReliability: doublePrecision("optimized_reliability").notNull(),
  baselineReliability: doublePrecision("baseline_reliability").notNull(),
  optimizedRenewableShare: doublePrecision("optimized_renewable_share").notNull(),
  baselineRenewableShare: doublePrecision("baseline_renewable_share").notNull(),
  energyMixData: jsonb("energy_mix_data").notNull(),
  priceData: jsonb("price_data").notNull(),
  emissionData: jsonb("emission_data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertOptimizationResultSchema = createInsertSchema(optimizationResults).omit({
  id: true,
  createdAt: true,
});

export type InsertOptimizationResult = z.infer<typeof insertOptimizationResultSchema>;
export type OptimizationResult = typeof optimizationResults.$inferSelect;
