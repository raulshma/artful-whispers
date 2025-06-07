import { users, diaryEntries, checkIns, type User, type DiaryEntry, type InsertDiaryEntry, type UpdateUserProfile, type CheckIn, type InsertCheckIn } from "@shared/schema";
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
  getDiaryEntriesByDate(userId: string, date: string): Promise<DiaryEntry[]>;
  toggleFavorite(id: number, userId: string): Promise<DiaryEntry | undefined>;
  
  // Check-in methods
  createCheckIn(checkIn: InsertCheckIn & { userId: string }): Promise<CheckIn>;
  getCheckIns(userId: string, limit?: number, offset?: number): Promise<CheckIn[]>;
  getCheckIn(id: number): Promise<CheckIn | undefined>;
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
        languages: profile.languages ? JSON.stringify(profile.languages) : undefined,
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

  async getDiaryEntriesByDate(userId: string, date: string): Promise<DiaryEntry[]> {
    const entries = await db
      .select()
      .from(diaryEntries)
      .where(
        and(eq(diaryEntries.date, date), eq(diaryEntries.userId, userId))
      )
      .orderBy(desc(diaryEntries.createdAt));
    return entries;
  }

  async toggleFavorite(id: number, userId: string): Promise<DiaryEntry | undefined> {
    // First get the current entry to check ownership and current favorite status
    const [currentEntry] = await db
      .select()
      .from(diaryEntries)
      .where(and(eq(diaryEntries.id, id), eq(diaryEntries.userId, userId)));
    
    if (!currentEntry) {
      return undefined;
    }

    // Toggle the favorite status
    const [updatedEntry] = await db
      .update(diaryEntries)
      .set({ isFavorite: !currentEntry.isFavorite })
      .where(eq(diaryEntries.id, id))
      .returning();
    
    return updatedEntry || undefined;
  }

  // Check-in methods
  async createCheckIn(insertCheckIn: InsertCheckIn & { userId: string }): Promise<CheckIn> {
    const [checkIn] = await db
      .insert(checkIns)
      .values({
        ...insertCheckIn,
        updatedAt: new Date(),
      })
      .returning();
    return checkIn;
  }

  async getCheckIns(userId: string, limit = 10, offset = 0): Promise<CheckIn[]> {
    const checkInList = await db
      .select()
      .from(checkIns)
      .where(eq(checkIns.userId, userId))
      .orderBy(desc(checkIns.createdAt))
      .limit(limit)
      .offset(offset);
    return checkInList;
  }

  async getCheckIn(id: number): Promise<CheckIn | undefined> {
    const [checkIn] = await db.select().from(checkIns).where(eq(checkIns.id, id));
    return checkIn || undefined;
  }
}

export const storage = new DatabaseStorage();
