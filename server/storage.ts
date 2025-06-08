import {
  users,
  diaryEntries,
  checkIns,
  userProfiles,
  userStats,
  userSettings,
  type User,
  type DiaryEntry,
  type InsertDiaryEntry,
  type UpdateUserProfile,
  type CheckIn,
  type InsertCheckIn,
  type UserProfile,
  type UserStats,
  type UserSettings,
  type UpdateUserSettings,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, or, and, count, sql, gt, lt, asc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUserProfile(
    id: string,
    profile: UpdateUserProfile
  ): Promise<User | undefined>;
  markUserOnboarded(id: string): Promise<User | undefined>;

  // Profile methods
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(
    userId: string,
    name: string,
    email: string
  ): Promise<UserProfile>;
  updateUserProfileData(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile | undefined>;

  // Stats methods
  getUserStats(userId: string): Promise<UserStats | undefined>;
  createUserStats(userId: string): Promise<UserStats>;
  updateUserStats(
    userId: string,
    updates: Partial<UserStats>
  ): Promise<UserStats | undefined>;
  calculateUserStats(userId: string): Promise<UserStats>;

  // Settings methods
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  createUserSettings(userId: string): Promise<UserSettings>;
  updateUserSettings(
    userId: string,
    updates: UpdateUserSettings
  ): Promise<UserSettings | undefined>;

  // Account management
  exportUserData(userId: string): Promise<any>;
  deleteUserAccount(userId: string): Promise<boolean>;

  // Diary entry methods
  getDiaryEntries(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<DiaryEntry[]>;
  getDiaryEntry(id: number): Promise<DiaryEntry | undefined>;
  getDiaryEntryByDate(
    userId: string,
    date: string
  ): Promise<DiaryEntry | undefined>;
  createDiaryEntry(
    entry: InsertDiaryEntry & { userId: string }
  ): Promise<DiaryEntry>;
  updateDiaryEntry(
    id: number,
    updates: Partial<DiaryEntry>
  ): Promise<DiaryEntry | undefined>;
  searchDiaryEntries(
    userId: string,
    query: string,
    limit?: number,
    offset?: number
  ): Promise<DiaryEntry[]>;
  getDiaryEntriesByDate(userId: string, date: string): Promise<DiaryEntry[]>;
  toggleFavorite(id: number, userId: string): Promise<DiaryEntry | undefined>;
  getAdjacentDiaryEntry(
    currentId: number,
    userId: string,
    direction: "next" | "previous"
  ): Promise<DiaryEntry | null>;

  // Check-in methods
  createCheckIn(checkIn: InsertCheckIn & { userId: string }): Promise<CheckIn>;
  getCheckIns(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<CheckIn[]>;
  getCheckIn(id: number): Promise<CheckIn | undefined>;
  // Stats methods (existing)
  getJournalSummaryStats(
    userId: string,
    period?: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    positive: number;
    neutral: number;
    negative: number;
    skipped: number;
    total: number;
  }>;
  getMoodCheckinDistribution(
    userId: string,
    period?: string,
    startDate?: string,
    endDate?: string
  ): Promise<
    Array<{
      mood: string;
      count: number;
      color: string;
      icon: string;
      percentage: number;
    }>
  >;
  getCalendarData(
    userId: string,
    year?: number,
    month?: number,
    startDate?: string,
    endDate?: string
  ): Promise<
    Array<{
      day: number;
      mood: "happy" | "neutral" | "sad" | "negative" | "skipped" | null;
      hasEntry: boolean;
    }>
  >;
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

  async getDiaryEntries(
    userId: string,
    limit = 10,
    offset = 0
  ): Promise<DiaryEntry[]> {
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
    const [entry] = await db
      .select()
      .from(diaryEntries)
      .where(eq(diaryEntries.id, id));
    return entry || undefined;
  }

  async getDiaryEntryByDate(
    userId: string,
    date: string
  ): Promise<DiaryEntry | undefined> {
    const [entry] = await db
      .select()
      .from(diaryEntries)
      .where(and(eq(diaryEntries.date, date), eq(diaryEntries.userId, userId)));
    return entry || undefined;
  }

  async createDiaryEntry(
    insertEntry: InsertDiaryEntry & { userId: string }
  ): Promise<DiaryEntry> {
    const [entry] = await db
      .insert(diaryEntries)
      .values({
        ...insertEntry,
        title: "Generating title...", // Temporary title until Gemini generates one
      })
      .returning();
    return entry;
  }

  async updateDiaryEntry(
    id: number,
    updates: Partial<DiaryEntry>
  ): Promise<DiaryEntry | undefined> {
    const [updatedEntry] = await db
      .update(diaryEntries)
      .set(updates)
      .where(eq(diaryEntries.id, id))
      .returning();
    return updatedEntry || undefined;
  }
  async updateUserProfile(
    id: string,
    profile: UpdateUserProfile
  ): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...profile,
        languages: profile.languages
          ? JSON.stringify(profile.languages)
          : undefined,
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

  async searchDiaryEntries(
    userId: string,
    query: string,
    limit = 10,
    offset = 0
  ): Promise<DiaryEntry[]> {
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

  async getDiaryEntriesByDate(
    userId: string,
    date: string
  ): Promise<DiaryEntry[]> {
    const entries = await db
      .select()
      .from(diaryEntries)
      .where(and(eq(diaryEntries.date, date), eq(diaryEntries.userId, userId)))
      .orderBy(desc(diaryEntries.createdAt));
    return entries;
  }

  async toggleFavorite(
    id: number,
    userId: string
  ): Promise<DiaryEntry | undefined> {
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

  async getAdjacentDiaryEntry(
    currentId: number,
    userId: string,
    direction: "next" | "previous"
  ): Promise<DiaryEntry | null> {
    // First get the current entry to find its creation date
    const [currentEntry] = await db
      .select()
      .from(diaryEntries)
      .where(
        and(eq(diaryEntries.id, currentId), eq(diaryEntries.userId, userId))
      );

    if (!currentEntry) {
      return null;
    }

    let adjacentEntry;

    if (direction !== "next") {
      // Get the next newer entry (created after current entry)
      [adjacentEntry] = await db
        .select()
        .from(diaryEntries)
        .where(
          and(
            eq(diaryEntries.userId, userId),
            gt(diaryEntries.createdAt, currentEntry.createdAt)
          )
        )
        .orderBy(asc(diaryEntries.createdAt))
        .limit(1);
    } else {
      // Get the previous older entry (created before current entry)
      [adjacentEntry] = await db
        .select()
        .from(diaryEntries)
        .where(
          and(
            eq(diaryEntries.userId, userId),
            lt(diaryEntries.createdAt, currentEntry.createdAt)
          )
        )
        .orderBy(desc(diaryEntries.createdAt))
        .limit(1);
    }

    return adjacentEntry || null;
  }

  // Check-in methods
  async createCheckIn(
    insertCheckIn: InsertCheckIn & { userId: string }
  ): Promise<CheckIn> {
    const [checkIn] = await db
      .insert(checkIns)
      .values({
        ...insertCheckIn,
        updatedAt: new Date(),
      })
      .returning();
    return checkIn;
  }

  async getCheckIns(
    userId: string,
    limit = 10,
    offset = 0
  ): Promise<CheckIn[]> {
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
    const [checkIn] = await db
      .select()
      .from(checkIns)
      .where(eq(checkIns.id, id));
    return checkIn || undefined;
  }
  // Stats methods implementation
  async getJournalSummaryStats(
    userId: string,
    period?: string,
    startDate?: string,
    endDate?: string
  ): Promise<{
    positive: number;
    neutral: number;
    negative: number;
    skipped: number;
    total: number;
  }> {
    let whereCondition = eq(diaryEntries.userId, userId);

    // Add date range filtering if specified
    if (startDate && endDate) {
      whereCondition = and(
        eq(diaryEntries.userId, userId),
        sql`${diaryEntries.createdAt} >= ${startDate}`,
        sql`${diaryEntries.createdAt} <= ${endDate}`
      )!;
    } else if (period) {
      // Fallback to period-based filtering for backward compatibility
      const now = new Date();
      let dateThreshold: Date;

      switch (period) {
        case "last30days":
          dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "last7days":
          dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "currentMonth":
          dateThreshold = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          dateThreshold = new Date(0); // All time
      }

      whereCondition = and(
        eq(diaryEntries.userId, userId),
        sql`${diaryEntries.createdAt} >= ${dateThreshold.toISOString()}`
      )!;
    }

    // Define mood categories
    const positiveMoods = [
      "happy",
      "joy",
      "excited",
      "grateful",
      "content",
      "optimistic",
      "cheerful",
      "positive",
    ];
    const neutralMoods = ["neutral", "calm", "okay", "normal", "balanced"];
    const negativeMoods = [
      "sad",
      "angry",
      "anxious",
      "frustrated",
      "depressed",
      "worried",
      "stressed",
      "negative",
    ];

    // Get all entries for the user within the period
    const entries = await db
      .select({ mood: diaryEntries.mood })
      .from(diaryEntries)
      .where(whereCondition);

    let positive = 0;
    let neutral = 0;
    let negative = 0;
    let skipped = 0;

    entries.forEach((entry) => {
      const mood = entry.mood?.toLowerCase();

      if (!mood || mood === "skipped" || mood === "") {
        skipped++;
      } else if (positiveMoods.some((pm) => mood.includes(pm))) {
        positive++;
      } else if (neutralMoods.some((nm) => mood.includes(nm))) {
        neutral++;
      } else if (negativeMoods.some((nm) => mood.includes(nm))) {
        negative++;
      } else {
        // Default unknown moods to neutral
        neutral++;
      }
    });

    const total = entries.length;

    return { positive, neutral, negative, skipped, total };
  }
  async getMoodCheckinDistribution(
    userId: string,
    period?: string,
    startDate?: string,
    endDate?: string
  ): Promise<
    Array<{
      mood: string;
      count: number;
      color: string;
      icon: string;
      percentage: number;
    }>
  > {
    let whereCondition = eq(checkIns.userId, userId);

    // Add date range filtering if specified
    if (startDate && endDate) {
      whereCondition = and(
        eq(checkIns.userId, userId),
        sql`${checkIns.createdAt} >= ${startDate}`,
        sql`${checkIns.createdAt} <= ${endDate}`
      )!;
    } else if (period) {
      // Fallback to period-based filtering for backward compatibility
      const now = new Date();
      let dateThreshold: Date;

      switch (period) {
        case "currentMonth":
          dateThreshold = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "last7days":
          dateThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "last30days":
          dateThreshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateThreshold = new Date(0); // All time
      }

      whereCondition = and(
        eq(checkIns.userId, userId),
        sql`${checkIns.createdAt} >= ${dateThreshold.toISOString()}`
      )!;
    }

    // Get mood distribution from check-ins
    const moodCounts = await db
      .select({
        mood: checkIns.mood,
        count: count(checkIns.mood).as("count"),
      })
      .from(checkIns)
      .where(whereCondition)
      .groupBy(checkIns.mood)
      .orderBy(desc(count(checkIns.mood)));

    // Calculate total for percentages
    const totalCheckIns = moodCounts.reduce(
      (sum, item) => sum + (item.count as number),
      0
    );

    // Map moods to colors and icons
    const moodMapping: Record<string, { color: string; icon: string }> = {
      happy: { color: "#4CAF50", icon: "happy-outline" },
      excited: { color: "#FF9800", icon: "happy-outline" },
      grateful: { color: "#2196F3", icon: "heart-outline" },
      content: { color: "#8BC34A", icon: "checkmark-circle-outline" },
      calm: { color: "#00BCD4", icon: "leaf-outline" },
      neutral: { color: "#FFC107", icon: "remove-circle-outline" },
      okay: { color: "#9E9E9E", icon: "remove-outline" },
      sad: { color: "#F44336", icon: "sad-outline" },
      angry: { color: "#E91E63", icon: "flame-outline" },
      anxious: { color: "#9C27B0", icon: "alert-circle-outline" },
      stressed: { color: "#FF5722", icon: "warning-outline" },
      worried: { color: "#795548", icon: "help-circle-outline" },
    };

    return moodCounts.map((item) => {
      const mood = item.mood.toLowerCase();
      const mapping = moodMapping[mood] || {
        color: "#757575",
        icon: "ellipse-outline",
      };
      const percentage =
        totalCheckIns > 0
          ? Math.round(((item.count as number) / totalCheckIns) * 100)
          : 0;

      return {
        mood: item.mood,
        count: item.count as number,
        color: mapping.color,
        icon: mapping.icon,
        percentage,
      };
    });
  }
  async getCalendarData(
    userId: string,
    year?: number,
    month?: number,
    startDate?: string,
    endDate?: string
  ): Promise<
    Array<{
      day: number;
      mood: "happy" | "neutral" | "sad" | "negative" | "skipped" | null;
      hasEntry: boolean;
    }>
  > {
    let firstDay: Date;
    let lastDay: Date;
    let daysInRange: number;

    if (startDate && endDate) {
      // Use provided date range
      firstDay = new Date(startDate);
      lastDay = new Date(endDate);
      daysInRange =
        Math.ceil(
          (lastDay.getTime() - firstDay.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;
    } else {
      // Fallback to year/month for backward compatibility
      const currentYear = year || new Date().getFullYear();
      const currentMonth = month || new Date().getMonth() + 1;
      firstDay = new Date(currentYear, currentMonth - 1, 1);
      lastDay = new Date(currentYear, currentMonth, 0);
      daysInRange = lastDay.getDate();
    }

    // Get all diary entries for the date range
    const entries = await db
      .select({
        date: diaryEntries.date,
        mood: diaryEntries.mood,
      })
      .from(diaryEntries)
      .where(
        and(
          eq(diaryEntries.userId, userId),
          sql`DATE(${diaryEntries.date}) >= ${
            firstDay.toISOString().split("T")[0]
          }`,
          sql`DATE(${diaryEntries.date}) <= ${
            lastDay.toISOString().split("T")[0]
          }`
        )
      );

    // Create a map of day -> mood for quick lookup
    const entryMap = new Map<number, string>();
    entries.forEach((entry) => {
      const day = new Date(entry.date).getDate();
      entryMap.set(day, entry.mood || "");
    });

    // Helper function to categorize mood
    const categorizeMood = (
      mood: string
    ): "happy" | "neutral" | "sad" | "negative" | "skipped" | null => {
      if (!mood || mood === "skipped") return "skipped";

      const lowerMood = mood.toLowerCase();
      const positiveMoods = [
        "happy",
        "joy",
        "excited",
        "grateful",
        "content",
        "optimistic",
        "cheerful",
        "positive",
      ];
      const neutralMoods = ["neutral", "calm", "okay", "normal", "balanced"];
      const negativeMoods = [
        "sad",
        "angry",
        "anxious",
        "frustrated",
        "depressed",
        "worried",
        "stressed",
        "negative",
      ];

      if (positiveMoods.some((pm) => lowerMood.includes(pm))) return "happy";
      if (neutralMoods.some((nm) => lowerMood.includes(nm))) return "neutral";
      if (negativeMoods.some((nm) => lowerMood.includes(nm))) return "negative";

      // Default to neutral for unknown moods
      return "neutral";
    };

    // Build calendar data for all days in the range
    const calendarData = [];
    if (startDate && endDate) {
      // For date ranges, we need to iterate day by day
      const currentDate = new Date(firstDay);
      while (currentDate <= lastDay) {
        const day = currentDate.getDate();
        const moodText = entryMap.get(day);
        const hasEntry = !!moodText;
        const mood = hasEntry ? categorizeMood(moodText) : null;

        calendarData.push({
          day,
          mood,
          hasEntry,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else {
      // For month-based queries, use the original logic
      for (let day = 1; day <= daysInRange; day++) {
        const moodText = entryMap.get(day);
        const hasEntry = !!moodText;
        const mood = hasEntry ? categorizeMood(moodText) : null;

        calendarData.push({
          day,
          mood,
          hasEntry,
        });
      }
    }

    return calendarData;
  }

  // Profile methods
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    return profile || undefined;
  }

  async createUserProfile(
    userId: string,
    name: string,
    email: string
  ): Promise<UserProfile> {
    const [profile] = await db
      .insert(userProfiles)
      .values({
        userId,
        name,
        email,
        joinDate: new Date(),
      })
      .returning();
    return profile;
  }

  async updateUserProfileData(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile | undefined> {
    const [updatedProfile] = await db
      .update(userProfiles)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updatedProfile || undefined;
  }
  // Stats methods
  async getUserStats(userId: string): Promise<UserStats | undefined> {
    const [stats] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId));
    return stats || undefined;
  }
  async createUserStats(userId: string): Promise<UserStats> {
    const [stats] = await db
      .insert(userStats)
      .values({
        userId,
        checkInsCount: 0,
        journalEntriesCount: 0,
        currentStreak: 0,
        longestStreak: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return stats;
  }

  async updateUserStats(
    userId: string,
    updates: Partial<UserStats>
  ): Promise<UserStats | undefined> {
    const [updatedStats] = await db
      .update(userStats)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userStats.userId, userId))
      .returning();
    return updatedStats || undefined;
  }
  async calculateUserStats(userId: string): Promise<UserStats> {
    // Get existing stats or create new ones
    let stats = await this.getUserStats(userId);
    if (!stats) {
      stats = await this.createUserStats(userId);
    }

    // Calculate diary entry stats
    const entries = await this.getDiaryEntries(userId, 1000); // Get all entries
    const checkIns = await this.getCheckIns(userId, 1000); // Get all check-ins

    const journalEntriesCount = entries.length;
    const checkInsCount = checkIns.length;

    // Calculate streaks based on activity (entries or check-ins)
    const { currentStreak, longestStreak } = this.calculateActivityStreaks(
      entries,
      checkIns
    );

    // Update stats
    const updatedStats = await this.updateUserStats(userId, {
      journalEntriesCount,
      checkInsCount,
      currentStreak,
      longestStreak,
    });

    return updatedStats || stats;
  }
  private calculateActivityStreaks(
    entries: DiaryEntry[],
    checkIns: CheckIn[]
  ): { currentStreak: number; longestStreak: number } {
    // Combine all activities and get unique dates
    const allActivities: Date[] = [];

    // Add diary entry dates
    entries.forEach((entry) => {
      allActivities.push(new Date(entry.createdAt));
    });

    // Add check-in dates
    checkIns.forEach((checkIn) => {
      allActivities.push(new Date(checkIn.createdAt));
    });

    if (allActivities.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Get unique dates (YYYY-MM-DD format) and sort them in ascending order
    const uniqueDates = Array.from(
      new Set(allActivities.map((date) => date.toISOString().split("T")[0]))
    ).sort();

    if (uniqueDates.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Calculate current streak (from today backwards)
    let currentStreak = 0;
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Check if user has activity today or yesterday to start streak
    const hasActivityToday = uniqueDates.includes(today);
    const hasActivityYesterday = uniqueDates.includes(yesterday);

    if (hasActivityToday || hasActivityYesterday) {
      // Start from the most recent activity date
      const startDate = hasActivityToday ? today : yesterday;
      let checkDate = new Date(startDate);

      // Count backwards from start date
      while (true) {
        const checkDateStr = checkDate.toISOString().split("T")[0];
        if (uniqueDates.includes(checkDateStr)) {
          currentStreak++;
          // Move to previous day
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i]);
      const previousDate = new Date(uniqueDates[i - 1]);
      const dayDifference = Math.round(
        (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDifference === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
  }

  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    return settings || undefined;
  }
  async createUserSettings(userId: string): Promise<UserSettings> {
    const [settings] = await db
      .insert(userSettings)
      .values({
        userId,
        notificationsEnabled: true,
        reminderEnabled: true,
        darkModeEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return settings;
  }

  async updateUserSettings(
    userId: string,
    updates: UpdateUserSettings
  ): Promise<UserSettings | undefined> {
    const [updatedSettings] = await db
      .update(userSettings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userSettings.userId, userId))
      .returning();
    return updatedSettings || undefined;
  }
  async exportUserData(userId: string): Promise<any> {
    const user = await this.getUserByEmail(""); // We'll need to get user differently
    const profile = await this.getUserProfile(userId);
    const entries = await this.getDiaryEntries(userId, 1000);
    const checkIns = await this.getCheckIns(userId, 1000);
    const stats = await this.getUserStats(userId);
    const settings = await this.getUserSettings(userId);

    return {
      user: { id: userId }, // Simplified user data
      profile,
      entries,
      checkIns,
      stats,
      settings,
      exportedAt: new Date().toISOString(),
    };
  }

  async deleteUserAccount(userId: string): Promise<boolean> {
    try {
      // Delete in order to respect foreign key constraints
      await db.delete(checkIns).where(eq(checkIns.userId, userId));
      await db.delete(diaryEntries).where(eq(diaryEntries.userId, userId));
      await db.delete(userStats).where(eq(userStats.userId, userId));
      await db.delete(userSettings).where(eq(userSettings.userId, userId));
      await db.delete(userProfiles).where(eq(userProfiles.userId, userId));
      await db.delete(users).where(eq(users.id, userId));

      return true;
    } catch (error) {
      console.error("Error deleting user account:", error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
