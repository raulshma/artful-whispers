import { config } from '@/config';
import { getSession } from './auth';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const session = await getSession();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
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
    credentials: 'include', // Important for cookies
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
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
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
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

export async function fetchJournalSummary(period?: string): Promise<JournalStatsData> {
  const endpoint = period ? `/api/stats/journal-summary?period=${period}` : '/api/stats/journal-summary';
  return apiRequest<JournalStatsData>(endpoint);
}

export async function fetchMoodCheckinDistribution(period?: string): Promise<MoodStat[]> {
  const endpoint = period ? `/api/stats/mood-checkin-distribution?period=${period}` : '/api/stats/mood-checkin-distribution';
  return apiRequest<MoodStat[]>(endpoint);
}

export interface CalendarDay {
  day: number;
  mood: 'happy' | 'neutral' | 'sad' | 'negative' | 'skipped' | null;
  hasEntry: boolean;
}

export async function fetchCalendarData(year?: number, month?: number): Promise<CalendarDay[]> {
  const currentDate = new Date();
  const targetYear = year || currentDate.getFullYear();
  const targetMonth = month || currentDate.getMonth() + 1;
  
  return apiRequest<CalendarDay[]>(`/api/stats/calendar-data?year=${targetYear}&month=${targetMonth}`);
}

export default apiRequest;
