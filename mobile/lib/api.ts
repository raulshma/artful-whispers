import { config } from "@/config";
import { getSession } from "./auth";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const session = await getSession();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add auth headers if session exists
  if (session) {
    // better-auth handles session cookies automatically, but we can add additional headers if needed
  }

  const url = `${config.API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // Important for cookies
  });

  if (!response.ok) {
    let errorMessage = "An error occurred";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // If we can't parse the error response, use the status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new ApiError(response.status, errorMessage);
  }

  // Handle empty responses
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return {} as T;
  }

  return response.json();
}

// Stats API functions
export interface JournalStatsData {
  positive: number;
  neutral: number;
  negative: number;
  skipped: number;
  total: number;
}

export interface MoodStat {
  mood: string;
  count: number;
  color: string;
  icon: string;
  percentage: number;
}

export async function fetchJournalSummary(
  period?: string,
  dateRange?: { startDate: Date; endDate: Date }
): Promise<JournalStatsData> {
  let endpoint = "/api/stats/journal-summary";
  const params = new URLSearchParams();

  if (dateRange) {
    params.append("startDate", dateRange.startDate.toISOString());
    params.append("endDate", dateRange.endDate.toISOString());
  } else if (period) {
    params.append("period", period);
  }

  if (params.toString()) {
    endpoint += `?${params.toString()}`;
  }

  return apiRequest<JournalStatsData>(endpoint);
}

export async function fetchMoodCheckinDistribution(
  period?: string,
  dateRange?: { startDate: Date; endDate: Date }
): Promise<MoodStat[]> {
  let endpoint = "/api/stats/mood-checkin-distribution";
  const params = new URLSearchParams();

  if (dateRange) {
    params.append("startDate", dateRange.startDate.toISOString());
    params.append("endDate", dateRange.endDate.toISOString());
  } else if (period) {
    params.append("period", period);
  }

  if (params.toString()) {
    endpoint += `?${params.toString()}`;
  }

  return apiRequest<MoodStat[]>(endpoint);
}

export interface CalendarDay {
  day: number;
  mood: "happy" | "neutral" | "sad" | "negative" | "skipped" | null;
  hasEntry: boolean;
}

export async function fetchCalendarData(
  year?: number,
  month?: number,
  dateRange?: { startDate: Date; endDate: Date }
): Promise<CalendarDay[]> {
  let endpoint = "/api/stats/calendar-data";
  const params = new URLSearchParams();

  if (dateRange) {
    params.append("startDate", dateRange.startDate.toISOString());
    params.append("endDate", dateRange.endDate.toISOString());
  } else {
    const currentDate = new Date();
    const targetYear = year || currentDate.getFullYear();
    const targetMonth = month || currentDate.getMonth() + 1;
    params.append("year", targetYear.toString());
    params.append("month", targetMonth.toString());
  }

  if (params.toString()) {
    endpoint += `?${params.toString()}`;
  }

  return apiRequest<CalendarDay[]>(endpoint);
}

// Profile API functions
export interface UserProfile {
  id: number;
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  joinDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  id: number;
  userId: string;
  checkInsCount: number;
  journalEntriesCount: number;
  currentStreak: number;
  longestStreak: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  id: number;
  userId: string;
  notificationsEnabled: boolean;
  reminderEnabled: boolean;
  darkModeEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function fetchUserProfile(): Promise<UserProfile> {
  return apiRequest<UserProfile>("/api/profile");
}

export async function updateUserProfile(
  updates: Partial<Pick<UserProfile, "name" | "email" | "avatarUrl">>
): Promise<UserProfile> {
  return apiRequest<UserProfile>("/api/profile", {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function fetchUserStats(): Promise<UserStats> {
  return apiRequest<UserStats>("/api/profile/stats");
}

export async function syncUserStats(): Promise<{
  message: string;
  stats: UserStats;
}> {
  return apiRequest<{ message: string; stats: UserStats }>(
    "/api/profile/stats/sync",
    {
      method: "POST",
    }
  );
}

export async function fetchUserSettings(): Promise<UserSettings> {
  return apiRequest<UserSettings>("/api/settings");
}

export async function updateUserSettings(
  updates: Partial<
    Pick<
      UserSettings,
      "notificationsEnabled" | "reminderEnabled" | "darkModeEnabled"
    >
  >
): Promise<UserSettings> {
  return apiRequest<UserSettings>("/api/settings", {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function exportUserData(): Promise<Blob> {
  const response = await fetch(`${config.API_BASE_URL}/api/account/export`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new ApiError(response.status, "Failed to export data");
  }

  return response.blob();
}

export async function deleteUserAccount(): Promise<void> {
  return apiRequest<void>("/api/account", {
    method: "DELETE",
  });
}

export default apiRequest;
