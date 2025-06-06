import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import apiRequest from '../lib/api';

// Import shared types if available, or define locally
export interface DiaryEntry {
  id: number;
  content: string;
  title: string;
  mood: string | null;
  emotions: string | null;
  imageUrl: string | null;
  imagePrompt: string | null;
  isFavorite?: boolean;
  date: string;
  createdAt: string;
  updatedAt?: string;
  userId: string;
}

export interface CreateDiaryEntryData {
  content: string;
  date: string;
}

export interface UpdateDiaryEntryData {
  content?: string;
  title?: string;
  mood?: string;
  emotions?: string;
}

export function useInfiniteDiaryEntries(limit: number = 10) {
  return useInfiniteQuery({
    queryKey: ['diary-entries', { limit }],
    queryFn: async ({ pageParam = 0 }) => {
      const entries = await apiRequest<DiaryEntry[]>(
        `/api/diary-entries?limit=${limit}&offset=${pageParam}`
      );
      return entries;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === limit ? allPages.length * limit : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateDiaryEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateDiaryEntryData) => {
      return apiRequest<DiaryEntry>('/api/diary-entries', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      // Invalidate and refetch diary entries
      queryClient.invalidateQueries({ queryKey: ['diary-entries'] });
    },
  });
}

export function useUpdateDiaryEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateDiaryEntryData }) => {
      return await apiRequest<DiaryEntry>(
        `/api/diary-entries/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(data),
        }
      );
    },
    onSuccess: () => {
      // Invalidate and refetch diary entries
      queryClient.invalidateQueries({ queryKey: ['diary-entries'] });
    },
  });
}

export function useFavoriteToggle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: number): Promise<DiaryEntry> => {
      return await apiRequest<DiaryEntry>(
        `/api/diary-entries/${entryId}/favorite`,
        {
          method: 'PATCH',
        }
      );
    },
    onSuccess: (updatedEntry) => {
      // Update the infinite query cache
      queryClient.setQueriesData(
        { queryKey: ['diary-entries'] },
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: DiaryEntry[]) =>
              page.map((entry) =>
                entry.id === updatedEntry.id ? updatedEntry : entry
              )
            ),
          };
        }
      );
    },
  });
}

export function useDiaryEntriesByDate(date: string) {
  return useQuery({
    queryKey: ['diary-entries', 'date', date],
    queryFn: async () => {
      return apiRequest<DiaryEntry[]>(`/api/diary-entries/date/${date}/all`);
    },
    enabled: !!date,
  });
}

export function useSearchDiaryEntries(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['diary-entries', 'search', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      return apiRequest<DiaryEntry[]>(`/api/diary-entries/search?q=${encodeURIComponent(query)}`);
    },
    enabled: enabled && !!query.trim(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
