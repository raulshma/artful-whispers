# Tasks for Integrating Mobile Check-in Flow with Backend

This document outlines the necessary steps to integrate the mobile application's check-in feature with the backend services, including database schema updates, API endpoint creation, and mobile application modifications.

## I. Define Check-in Data & Schema

- [x] **Finalize Check-in Data Points:**
    - [x] Mood (e.g., 'overjoyed', 'happy', 'neutral', 'sad', 'depressed')
    - [x] Mood Causes (Array of strings, e.g., `["work-stress", "family"]`)
    - [x] Mood Intensity (Integer, e.g., 1-10 or 1-5 scale)
    - [x] Additional Notes (Text, optional)
    - [x] Companions (Array of strings, e.g., `["alone", "family"]`)
    - [x] Location (String, e.g., 'home', 'work', or custom input)
    - [x] Custom Location Details (Text, optional, if location is 'other' or needs more context)
    - [x] Timestamp of check-in (`created_at`)
    - [x] User ID (`user_id`) to link to the `users` table.

- [x] **Design Database Schema (`check_ins` table):**
    - [x] `id`: Primary Key (e.g., UUID or auto-incrementing integer)
    - [x] `user_id`: Foreign Key referencing `users.id`
    - [x] `mood`: Text, Not Null
    - [x] `mood_causes`: JSONB or Text Array
    - [x] `mood_intensity`: Integer
    - [x] `notes`: Text
    - [x] `companions`: JSONB or Text Array
    - [x] `location`: Text
    - [x] `custom_location_details`: Text
    - [x] `created_at`: Timestamp, Default NOW()
    - [x] `updated_at`: Timestamp, Default NOW() (for potential future edits)

## II. Backend Development (`server/` & `shared/` directories)

- [x] **Update `shared/schema.ts`:**
    - [x] Define the `checkIns` table schema using Drizzle ORM, corresponding to the design in I.2.
    - [x] Establish a relation between `checkIns` and `users`.

- [x] **Database Migrations:**
    - [x] Generate a new migration file using Drizzle Kit: `pnpm run db:push` (equivalent command).
    - [x] Review the generated migration SQL.
    - [x] Apply the migration to the database: `pnpm run db:push` (equivalent command).

- [x] **Update `server/routes.ts`:**
    - [x] **Create `POST /api/check-ins` Endpoint:**
        - [x] This endpoint will be protected and require authentication.
        - [x] It will accept the check-in data (mood, causes, intensity, notes, companions, location) in the request body.
        - [x] Implement robust input validation (e.g., using Zod or a similar library).
        - [x] Upon successful validation, insert the new check-in record into the `check_ins` table, associating it with the `req.user.id`.
        - [x] Return a success response (e.g., `201 Created` with the created check-in data or a success message).
        - [x] Handle potential errors (e.g., validation errors, database errors) and return appropriate error responses.
    - [x] **(Optional) Create `GET /api/check-ins` Endpoint(s):**
        - [x] Consider endpoints for fetching a user's check-in history (paginated).
        - [x] Consider endpoints for fetching aggregated check-in data for insights (this might be a more advanced feature for later).

- [x] **Create Service Layer (Recommended):**
    - [x] Consider creating a `checkInService.ts` to encapsulate the business logic for creating and retrieving check-ins, keeping the route handlers lean.

## III. Mobile App Integration (`mobile/` directory)

- [x] **Create Check-in Context/State Management:**
    - [x] Implement a React Context (e.g., `CheckInContext`) or use a state management library (like Zustand or Redux Toolkit) to manage the check-in data across the multiple steps of the check-in flow (`step1.tsx` through `step4.tsx`).
    - [x] The context/store should hold fields for `mood`, `moodCauses`, `moodIntensity`, `notes`, `companions`, and `location`.

- [x] **Update Check-in Step Components (`mobile/app/checkin/step*.tsx`):**
    - [x] **`step1.tsx` (Mood):**
        - [x] On `handleContinue`, update the `mood` in the CheckInContext/store.
    - [x] **`step2.tsx` (Causes, Intensity, Notes):**
        - [x] Collect `moodCauses`, `moodIntensity` (from slider), and `notes` (from text area).
        - [x] On `handleContinue`, update these fields in the CheckInContext/store.
    - [x] **`step3.tsx` (Companions):**
        - [x] On `handleContinue`, update `selectedCompanions` in the CheckInContext/store.
    - [x] **`step4.tsx` (Location):**
        - [x] Collect `location` (selected or custom).
        - [x] On `handleContinue`, update `location` and `customLocationDetails` in the CheckInContext/store and navigate to `complete`.

- [x] **Update `mobile/app/checkin/complete.tsx`:**
    - [x] Retrieve the complete check-in data object from the CheckInContext/store.
    - [x] Implement an API call function (e.g., `submitCheckIn`) that sends a `POST` request to `/api/check-ins` with the collected data.
    - [x] Call `submitCheckIn` within a `useEffect` hook or when a "Save" or "Complete" button is pressed.
    - [x] Display loading indicators during the API call.
    - [x] Handle success: Navigate to a confirmation screen or back to the main app, potentially clearing the check-in state.
    - [x] Handle errors: Display user-friendly error messages (e.g., using a toast notification).

- [x] **Update API Client (`mobile/lib/api.ts` or create `mobile/services/checkinService.ts`):**
    - [x] Add a new function, e.g., `createCheckIn(checkInData: CheckInData): Promise<CheckInResponse>`.
    - [x] This function will use the existing `apiRequest` helper to make the authenticated `POST` request to `/api/check-ins`.
    - [x] Define TypeScript interfaces for `CheckInData` (payload) and `CheckInResponse` (expected API response).

- [x] **Update Navigation and Parameters:**
    - [x] Ensure that navigation between check-in steps correctly passes any necessary parameters or relies on the central context/store.
    - [x] The `useLocalSearchParams` might still be useful for passing intermediate identifiers if not using a global state for everything immediately.

## IV. Testing & Refinement

- [ ] **Unit Tests:**
    - [ ] Write unit tests for backend validation logic and service functions.
    - [ ] Write unit tests for mobile app state management and API call functions.
- [ ] **Integration Tests:**
    - [ ] Test the API endpoint directly using a tool like Postman or Insomnia.
- [ ] **End-to-End (E2E) Testing:**
    - [ ] Manually test the entire check-in flow on the mobile app:
        - [ ] Data entry across all steps.
        - [ ] Submission to the backend.
        - [ ] Verification of data in the database.
        - [ ] Error handling (e.g., network issues, validation errors).
        - [ ] UI feedback for loading, success, and error states.
- [ ] **Refine UI/UX:**
    - [ ] Ensure the flow is intuitive and provides clear feedback to the user.
    - [ ] Optimize loading states and transitions.

## V. (Optional) Enhancements

*   **Offline Support:** Implement logic to save check-ins locally if the device is offline and sync them when connectivity is restored.
*   **Advanced Insights:** Develop backend logic and UI components to display insights based on collected check-in data over time.
*   **Edit/Delete Check-ins:** Implement functionality for users to edit or delete their past check-in entries.

This plan provides a comprehensive roadmap for the integration. Prioritization of optional features can be decided based on project timelines and resources.
