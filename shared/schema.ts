import { pgTable, text, serial, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  image: text("image"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  bio: text("bio"),
  timezone: text("timezone").default("UTC"),
  gender: text("gender"),
  nationality: text("nationality"),
  languages: text("languages"), // JSON string array
  isOnboarded: text("is_onboarded").default("false"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const diaryEntries = pgTable("diary_entries", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  mood: text("mood"),
  emotions: text("emotions"), // JSON string array
  imagePrompt: text("image_prompt"),
  imageUrl: text("image_url"),
  isFavorite: boolean("is_favorite").default(false),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
});

export const checkIns = pgTable("check_ins", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  mood: text("mood").notNull(),
  moodCauses: jsonb("mood_causes").$type<string[]>().default([]),
  moodIntensity: integer("mood_intensity").notNull(),
  notes: text("notes"),
  companions: jsonb("companions").$type<string[]>().default([]),
  location: text("location"),
  customLocationDetails: text("custom_location_details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User Profile schema for profile-specific operations
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatarUrl: text("avatar_url"),
  joinDate: timestamp("join_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User Statistics schema
export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  checkInsCount: integer("check_ins_count").default(0).notNull(),
  journalEntriesCount: integer("journal_entries_count").default(0).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User Settings schema
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  notificationsEnabled: boolean("notifications_enabled").default(true).notNull(),
  reminderEnabled: boolean("reminder_enabled").default(true).notNull(),
  darkModeEnabled: boolean("dark_mode_enabled").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many, one }) => ({
  checkIns: many(checkIns),
  diaryEntries: many(diaryEntries),
  profile: one(userProfiles),
  stats: one(userStats),
  settings: one(userSettings),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, {
    fields: [userStats.userId],
    references: [users.id],
  }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const checkInsRelations = relations(checkIns, ({ one }) => ({
  user: one(users, {
    fields: [checkIns.userId],
    references: [users.id],
  }),
}));

export const diaryEntriesRelations = relations(diaryEntries, ({ one }) => ({
  user: one(users, {
    fields: [diaryEntries.userId],
    references: [users.id],
  }),
}));

export const updateUserProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  bio: z.string().optional(),
  timezone: z.string().default("UTC"),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  languages: z.array(z.string()).optional(),
});

// Schema for profile operations
export const userProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  avatarUrl: z.string().url().optional(),
});

export const updateUserSettingsSchema = z.object({
  notificationsEnabled: z.boolean().optional(),
  reminderEnabled: z.boolean().optional(),
  darkModeEnabled: z.boolean().optional(),
});

export const insertDiaryEntrySchema = createInsertSchema(diaryEntries).pick({
  content: true,
  date: true,
});

export const insertCheckInSchema = createInsertSchema(checkIns).pick({
  mood: true,
  moodCauses: true,
  moodIntensity: true,
  notes: true,
  companions: true,
  location: true,
  customLocationDetails: true,
});

export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type UserStats = typeof userStats.$inferSelect;
export type UserSettings = typeof userSettings.$inferSelect;
export type UpdateUserSettings = z.infer<typeof updateUserSettingsSchema>;
export type User = typeof users.$inferSelect;
export type DiaryEntry = typeof diaryEntries.$inferSelect;
export type InsertDiaryEntry = z.infer<typeof insertDiaryEntrySchema>;
export type CheckIn = typeof checkIns.$inferSelect;
export type InsertCheckIn = z.infer<typeof insertCheckInSchema>;
