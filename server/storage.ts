import {
  users,
  optimizationResults,
  type User,
  type UpsertUser,
  type InsertOptimizationResult,
  type OptimizationResult,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Optimization results operations
  saveOptimizationResult(result: InsertOptimizationResult): Promise<OptimizationResult>;
  getUserOptimizationResults(userId: string, limit?: number): Promise<OptimizationResult[]>;
  getOptimizationResult(id: string): Promise<OptimizationResult | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Optimization results operations
  async saveOptimizationResult(result: InsertOptimizationResult): Promise<OptimizationResult> {
    const [saved] = await db
      .insert(optimizationResults)
      .values(result)
      .returning();
    return saved;
  }

  async getUserOptimizationResults(userId: string, limit = 10): Promise<OptimizationResult[]> {
    return await db
      .select()
      .from(optimizationResults)
      .where(eq(optimizationResults.userId, userId))
      .orderBy(desc(optimizationResults.createdAt))
      .limit(limit);
  }

  async getOptimizationResult(id: string): Promise<OptimizationResult | undefined> {
    const [result] = await db
      .select()
      .from(optimizationResults)
      .where(eq(optimizationResults.id, id));
    return result;
  }
}

export const storage = new DatabaseStorage();
