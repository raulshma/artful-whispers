import { useState, useCallback, useMemo } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import type { DiaryEntry } from '@shared/schema';

interface UseInfiniteEntriesOptions {
  limit?: number;
}

export function useInfiniteEntries({ limit = 5 }: UseInfiniteEntriesOptions = {}) {
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isSuccess,
  } = useInfiniteQuery({
    queryKey: ['/api/diary-entries', { limit }],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(`/api/diary-entries?limit=${limit}&offset=${pageParam}`);
      if (!response.ok) throw new Error('Failed to fetch entries');
      return response.json();
    },
    getNextPageParam: (lastPage: DiaryEntry[], allPages) => {
      return lastPage.length === limit ? allPages.length * limit : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Flatten all pages into a single array of entries
  const entries = useMemo(() => {
    return data?.pages.flatMap(page => page) ?? [];
  }, [data]);

  const refreshEntries = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ['/api/diary-entries'],
      refetchType: 'all',
    });
  }, [queryClient]);

  return {
    entries,
    fetchNextPage,
    hasNextPage: !!hasNextPage,
    isFetchingNextPage,
    isLoading,
    isSuccess,
    refreshEntries,
  };
}
