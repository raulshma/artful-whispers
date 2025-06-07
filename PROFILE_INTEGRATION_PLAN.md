# Profile Tab Backend Integration Plan

## 1. User Profile Data
- [x] **Schema:** Define a `UserProfile` schema in `shared/schema.ts`.
    - Include fields: `userId` (references `User` table), `name` (string), `email` (string, unique), `joinDate` (datetime), `avatarUrl` (string, optional).
- [x] **Backend Route (GET):** Create a route in `server/routes.ts` to fetch user profile data.
    - Endpoint: `/api/profile`
    - Logic: Retrieve user profile based on authenticated `userId`.
- [x] **Backend Route (PUT):** Create a route in `server/routes.ts` to update user profile data.
    - Endpoint: `/api/profile`
    - Logic: Update user profile fields. Ensure proper validation.
- [x] **Mobile Integration:**
    - Fetch profile data in `ProfileScreen` using a hook (e.g., `useUserProfile`).
    - Implement `handleEditProfile` to navigate to an edit profile screen (to be created) or show a modal for editing.
    - Update local state and call the PUT endpoint on save.

## 2. User Statistics
- [x] **Schema:**
    - `UserStats` schema in `shared/schema.ts`.
        - Fields: `userId` (references `User` table), `checkInsCount` (integer), `journalEntriesCount` (integer), `currentStreak` (integer), `longestStreak` (integer).
    - Consider if these stats can be derived/calculated or need to be stored and updated.
- [x] **Backend Logic:**
    - Implement logic in `server/services/` (e.g., `profileService.ts`) to calculate/update these stats when relevant actions occur (new check-in, new journal entry).
    - This might involve triggers or updates in existing services like `checkinService.ts` and a new `journalService.ts`.
- [x] **Backend Route (GET):** Create a route in `server/routes.ts` to fetch user statistics.
    - Endpoint: `/api/profile/stats`
    - Logic: Retrieve user stats based on authenticated `userId`.
- [x] **Mobile Integration:**
    - Fetch user stats in `ProfileScreen` and display them.
    - Update the hardcoded values (42 check-ins, 18 journal entries, 7 day streak) with data from the backend.

## 3. User Settings/Preferences
- [x] **Schema:** Define a `UserSettings` schema in `shared/schema.ts`.
    - Fields: `userId` (references `User` table), `notificationsEnabled` (boolean, default true), `reminderEnabled` (boolean, default true), `darkModeEnabled` (boolean, default false).
- [x] **Backend Route (GET):** Create a route in `server/routes.ts` to fetch user settings.
    - Endpoint: `/api/settings`
- [x] **Backend Route (PUT):** Create a route in `server/routes.ts` to update user settings.
    - Endpoint: `/api/settings`
    - Logic: Update specific settings.
- [x] **Mobile Integration:**
    - Fetch user settings in `ProfileScreen`.
    - Update the `useState` for `notificationsEnabled`, `reminderEnabled`, and `isDarkMode` with fetched data.
    - When a switch is toggled, call the PUT endpoint to update the setting on the backend.
    - Ensure `toggleTheme` in `ThemeContext` also persists the dark mode preference to the backend.

## 4. Account Management
- [x] **Export Data:**
    - **Backend Route (GET):** Create a route in `server/routes.ts` for data export.
        - Endpoint: `/api/account/export`
        - Logic: Gather all user data (profile, check-ins, journal entries) and return it in a downloadable format (e.g., JSON).
    - **Mobile Integration:** Implement `handleExportData` to call this endpoint and handle the file download/sharing.
- [x] **Delete Account:**
    - **Backend Route (DELETE):** Create a route in `server/routes.ts` for account deletion.
        - Endpoint: `/api/account`
        - Logic:
            - Perform a soft delete or hard delete based on application policy.
            - Ensure all associated user data is handled (deleted or anonymized).
            - Invalidate user session/token.
    - **Mobile Integration:**
        - Implement `handleDeleteAccount` to:
            - Show a confirmation dialog.
            - If confirmed, call the DELETE endpoint.
            - Sign the user out and navigate to the auth screen upon successful deletion.

## 5. General Backend Setup
- [x] **Database Migrations:** Create necessary database migration files in `migrations/` for the new tables/columns defined in the schemas.
- [x] **Service Layer:** Create or update services in `server/services/` to encapsulate business logic related to profile, stats, and settings.
- [x] **Authentication & Authorization:** Ensure all new backend routes are protected and only accessible by the authenticated user for their own data.
- [x] **Error Handling:** Implement robust error handling on both backend and mobile for all API calls.
- [x] **API Client:** Update `mobile/lib/api.ts` to include functions for interacting with the new backend endpoints.

## 6. Mobile UI/UX Enhancements (Optional but Recommended)
- [x] **Loading States:** Show loading indicators while data is being fetched or updated, utilize the skia loading components.
- [x] **Feedback:** Provide user feedback (e.g., toasts, alerts) for successful operations or errors.
- [ ] **Edit Profile Screen:** Design and implement a dedicated screen or modal for editing profile information (name, avatar).
- [ ] **Avatar Handling:** If implementing avatar uploads:
    - Add image upload functionality (client-side).
    - Backend storage for avatars (e.g., using `server/storage.ts` if it's set up for file storage, or a cloud service).
    - Update `UserProfile` schema and routes.

## 7. Journey Stats Sync Feature
- [x] **Backend Route (POST):** Create a route in `server/routes.ts` for syncing/recalculating user statistics.
    - Endpoint: `/api/profile/stats/sync`
    - Logic: Force recalculation of all user stats (check-ins, journal entries, streaks).
- [x] **API Client:** Add `syncUserStats` function in `mobile/lib/api.ts`.
- [x] **Mobile Integration:** Add "Sync Stats" button in the Journey section of ProfileScreen.
    - Show loading state while syncing.
    - Provide success/error feedback to user.
    - Update stats display with refreshed data.