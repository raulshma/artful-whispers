import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DiaryEntry } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useFavoriteToggle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: number): Promise<DiaryEntry> => {
      const response = await apiRequest(
        "PATCH",
        `/api/diary-entries/${entryId}/favorite`
      );

      if (!response.ok) {
        throw new Error("Failed to toggle favorite");
      }

      return response.json();
    },
    onSuccess: (updatedEntry) => {
      // Update the infinite query cache
      queryClient.setQueriesData(
        { queryKey: ["/api/diary-entries"] },
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
