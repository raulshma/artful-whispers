import { users, diaryEntries, type User, type InsertUser, type DiaryEntry, type InsertDiaryEntry, type UpdateUserProfile } from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, or } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: number, profile: UpdateUserProfile): Promise<User | undefined>;
  markUserOnboarded(id: number): Promise<User | undefined>;
  
  // Diary entry methods
  getDiaryEntries(limit?: number, offset?: number): Promise<DiaryEntry[]>;
  getDiaryEntry(id: number): Promise<DiaryEntry | undefined>;
  getDiaryEntryByDate(date: string): Promise<DiaryEntry | undefined>;
  createDiaryEntry(entry: InsertDiaryEntry): Promise<DiaryEntry>;
  updateDiaryEntry(id: number, updates: Partial<DiaryEntry>): Promise<DiaryEntry | undefined>;
  searchDiaryEntries(query: string, limit?: number, offset?: number): Promise<DiaryEntry[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getDiaryEntries(limit = 10, offset = 0): Promise<DiaryEntry[]> {
    const entries = await db
      .select()
      .from(diaryEntries)
      .orderBy(desc(diaryEntries.createdAt))
      .limit(limit)
      .offset(offset);
    return entries;
  }

  async getDiaryEntry(id: number): Promise<DiaryEntry | undefined> {
    const [entry] = await db.select().from(diaryEntries).where(eq(diaryEntries.id, id));
    return entry || undefined;
  }

  async getDiaryEntryByDate(date: string): Promise<DiaryEntry | undefined> {
    const [entry] = await db.select().from(diaryEntries).where(eq(diaryEntries.date, date));
    return entry || undefined;
  }

  async createDiaryEntry(insertEntry: InsertDiaryEntry): Promise<DiaryEntry> {
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

  async updateUserProfile(id: number, profile: UpdateUserProfile): Promise<User | undefined> {
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

  async markUserOnboarded(id: number): Promise<User | undefined> {
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

  async searchDiaryEntries(query: string, limit = 10, offset = 0): Promise<DiaryEntry[]> {
    const entries = await db
      .select()
      .from(diaryEntries)
      .where(
        or(
          ilike(diaryEntries.title, `%${query}%`),
          ilike(diaryEntries.content, `%${query}%`),
          ilike(diaryEntries.mood, `%${query}%`)
        )
      )
      .orderBy(desc(diaryEntries.createdAt))
      .limit(limit)
      .offset(offset);
    return entries;
  }
}

export const storage = new DatabaseStorage();
