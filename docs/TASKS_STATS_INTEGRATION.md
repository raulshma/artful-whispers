# Stats Tab Backend Integration Tasks

## Objective
Integrate the Stats tab in the mobile application with the backend to display dynamic, user-specific statistics related to their journal entries and mood check-ins.

## 1. Backend Development

### 1.1. Schema Review (`shared/schema.ts`)
- [x] **Status:** Initial Review Complete.
-   **Tables to be used:**
    -   `diary_entries`: For journal-related stats (mood, date). The `mood` column is `text`, so conventions for "positive", "negative", "neutral", and how to identify "skipped" (e.g., NULL or specific string) need to be established.
    -   `check_ins`: For mood check-in related stats (mood, moodIntensity, createdAt). The `mood` column is `text`.
-   **Action:** Confirm if existing schema is sufficient. No immediate changes anticipated, but this will be verified during implementation of aggregation logic.

### 1.2. API Endpoints (`server/routes.ts`)
- [x] **`GET /api/stats/journal-summary`** (Protected Route)
    -   **Purpose:** Provide aggregated data for the `JournalStats.tsx` component.
    -   **Data Source:** `diary_entries` table.
    -   **Response Body Example:**
        ```json
        {
          "positive": 15,
          "neutral": 10,
          "negative": 5,
          "skipped": 3, // Entries with no mood or a "skipped" mood
          "total": 33
        }
        ```
    -   **Query Parameters (Optional):** `period` (e.g., `?period=last30days`, `?period=allTime`)
- [x] **`GET /api/stats/mood-checkin-distribution`** (Protected Route)
    -   **Purpose:** Provide data for the `MoodStatsCard.tsx` component, showing distribution of moods from check-ins.
    -   **Data Source:** `check_ins` table.
    -   **Response Body Example:**
        ```json
        [
          { "mood": "Happy", "count": 25, "color": "#4CAF50", "icon": "happy-outline", "percentage": 50 },
          { "mood": "Neutral", "count": 15, "color": "#FFC107", "icon": "remove-circle-outline", "percentage": 30 },
          { "mood": "Sad", "count": 10, "color": "#F44336", "icon": "sad-outline", "percentage": 20 }
        ]
        ```
    -   **Query Parameters (Optional):** `period` (e.g., `?period=currentMonth`, `?period=last7days`)

### 1.3. Backend Logic (e.g., `server/storage.ts` or new `server/services/statsService.ts`)
- [x] **Task:** Implement functions to query and aggregate data from PostgreSQL using Drizzle ORM for the new endpoints.
-   **Function Examples:**
    -   `getJournalSummaryStats(userId: string, period?: string): Promise<{ positive: number, neutral: number, negative: number, skipped: number, total: number }>`
        -   Logic to count entries by mood category. Define how "positive", "neutral", "negative" are identified from the `mood` text field in `diary_entries`.
        -   Define how "skipped" entries are identified (e.g., `mood IS NULL` or `mood = 'skipped'`).
    -   `getMoodCheckinDistribution(userId: string, period?: string): Promise<Array<{ mood: string, count: number, color: string, icon: string, percentage: number }>>`
        -   Logic to group `check_ins` by `mood` and calculate counts and percentages.
        -   Map mood strings to colors and icons (this mapping might also live partially on the frontend or be configurable).

## 2. Mobile App Development

### 2.1. API Client (`mobile/lib/api.ts`)
- [x] **Task:** Add functions to call the new stats API endpoints.
-   **Function Examples:**
    -   `fetchJournalSummary(period?: string): Promise<JournalStatsData>`
    -   `fetchMoodCheckinDistribution(period?: string): Promise<MoodStat[]>`
    -   Ensure `JournalStatsData` and `MoodStat` types align with API responses and component props.

### 2.2. Stats Tab Screen (e.g., `mobile/app/(tabs)/index.tsx` or a dedicated stats screen)
- [x] **Task:**
    -   Use a data fetching hook (e.g., `useQuery` from TanStack Query, if `queryClient.ts` implies its usage) to fetch data from the new API client functions.
    -   Pass the fetched data to `JournalStats.tsx` and `MoodStatsCard.tsx` components.
    -   Implement loading states (e.g., display skeletons or loading indicators).
    -   Implement error states (e.g., display an error message with a retry option).
    -   Consider adding UI elements for selecting different time periods if `period` query parameters are implemented.

### 2.3. Component Updates
- [x] **`mobile/components/JournalStats.tsx`:**
    - [x] **Task:** Ensure the component can correctly consume the `JournalStatsData` fetched from the API. Verify props and internal logic.
- [x] **`mobile/components/MoodStatsCard.tsx`:**
    - [x] **Task:** Ensure the component can correctly consume the `MoodStat[]` array fetched from the API. Verify props and internal logic, especially for rendering bars and percentages.

## 3. Testing
- [x] **Backend:**
    - [x] Unit tests for the aggregation logic in `storage.ts` or `statsService.ts`.
    - [x] Integration tests for the new API endpoints (`/api/stats/journal-summary`, `/api/stats/mood-checkin-distribution`).
- [x] **Mobile App:**
    - [x] Test the Stats tab with various data scenarios (empty data, some data, error states, loading states).
    - [x] Verify correct data display in `JournalStats` and `MoodStatsCard`.

## 4. Definition of Mood Categories
- [x] Establish a clear mapping for how text-based `mood` fields in `diary_entries` and `check_ins` translate to categories like "positive", "neutral", "negative". This could be:
    -   A predefined list of keywords for each category.
    -   A more complex sentiment analysis if moods are free-text (though current schema suggests discrete values).
    -   For `check_ins`, `moodIntensity` might also play a role.
-   This definition will be crucial for the backend aggregation logic.

## Notes
- The `JournalStats.tsx` component currently has `data.skipped`. The backend logic for `getJournalSummaryStats` needs to define what constitutes a "skipped" entry.
- The `MoodStatsCard.tsx` expects `color` and `icon` as part of its `MoodStat` data. The backend endpoint `getMoodCheckinDistribution` should provide this, or the frontend should map moods to these visual elements. It's often better if the backend provides this if the set of moods is dynamic or configured server-side. If moods are static and known client-side, client-side mapping is also an option.
