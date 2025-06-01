import { users, diaryEntries, type User, type DiaryEntry, type InsertDiaryEntry, type UpdateUserProfile } from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, or, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUserProfile(id: string, profile: UpdateUserProfile): Promise<User | undefined>;
  markUserOnboarded(id: string): Promise<User | undefined>;
  
  // Diary entry methods
  getDiaryEntries(userId: string, limit?: number, offset?: number): Promise<DiaryEntry[]>;
  getDiaryEntry(id: number): Promise<DiaryEntry | undefined>;
  getDiaryEntryByDate(userId: string, date: string): Promise<DiaryEntry | undefined>;
  createDiaryEntry(entry: InsertDiaryEntry & { userId: string }): Promise<DiaryEntry>;
  updateDiaryEntry(id: number, updates: Partial<DiaryEntry>): Promise<DiaryEntry | undefined>;
  searchDiaryEntries(userId: string, query: string, limit?: number, offset?: number): Promise<DiaryEntry[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getDiaryEntries(userId: string, limit = 10, offset = 0): Promise<DiaryEntry[]> {
    const entries = await db
      .select()
      .from(diaryEntries)
      .where(eq(diaryEntries.userId, userId))
      .orderBy(desc(diaryEntries.createdAt))
      .limit(limit)
      .offset(offset);
    return entries;
  }

  async getDiaryEntry(id: number): Promise<DiaryEntry | undefined> {
    const [entry] = await db.select().from(diaryEntries).where(eq(diaryEntries.id, id));
    return entry || undefined;
  }

  async getDiaryEntryByDate(userId: string, date: string): Promise<DiaryEntry | undefined> {
    const [entry] = await db
      .select()
      .from(diaryEntries)
      .where(
        and(eq(diaryEntries.date, date), eq(diaryEntries.userId, userId))
      );
    return entry || undefined;
  }

  async createDiaryEntry(insertEntry: InsertDiaryEntry & { userId: string }): Promise<DiaryEntry> {
    const [entry] = await db
      .insert(diaryEntries)
      .values({
        ...insertEntry,
        title: "Generating title...", // Temporary title until Gemini generates one
      })
      .returning();
    return entry;
  }

  async updateDiaryEntry(id: number, updates: Partial<DiaryEntry>): Promise<DiaryEntry | undefined> {
    const [updatedEntry] = await db
      .update(diaryEntries)
      .set(updates)
      .where(eq(diaryEntries.id, id))
      .returning();
    return updatedEntry || undefined;
  }

  async updateUserProfile(id: string, profile: UpdateUserProfile): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...profile,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async markUserOnboarded(id: string): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        isOnboarded: "true",
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async searchDiaryEntries(userId: string, query: string, limit = 10, offset = 0): Promise<DiaryEntry[]> {
    const entries = await db
      .select()
      .from(diaryEntries)
      .where(
        and(
          eq(diaryEntries.userId, userId),
          or(
            ilike(diaryEntries.title, `%${query}%`),
            ilike(diaryEntries.content, `%${query}%`),
            ilike(diaryEntries.mood, `%${query}%`)
          )
        )
      )
      .orderBy(desc(diaryEntries.createdAt))
      .limit(limit)
      .offset(offset);
    return entries;
  }
}

export const storage = new DatabaseStorage();
