# Mobile App Redesign Plan

This document outlines the step-by-step plan to redesign the mobile application based on the provided designs, incorporating React Native Skia for 2D graphics and other necessary libraries.

## 1. Project Setup & Configuration

- [x] **Initialize/Verify Expo Project:** Ensure the existing Expo project in `mobile/` is up-to-date and configured correctly.
- [x] **Install Core Dependencies:**
    - [x] `react-native-skia` (for 2D graphics)
    - [x] `react-navigation` (if needing to augment Expo Router's capabilities, though Expo Router should suffice for most needs)
    - [x] `react-native-reanimated` (for advanced animations)
    - [x] `react-native-gesture-handler` (for gesture interactions)
    - [x] `expo-av` (for audio recording and playback)
    - [x] `expo-haptics` (for tactile feedback)
    - [x] `date-fns` or `dayjs` (for date/time manipulation)
    - [x] `react-native-svg` (if using SVGs for icons not drawn with Skia)
    - [x] `zustand` or `jotai` (for client-side global state, if TanStack Query + Context API is insufficient)
    - [x] `react-native-maps` (for the "Select Location" feature, if a native map is preferred)
- [x] **Configure TypeScript:** Ensure `tsconfig.json` is set up for new libraries and paths.
- [x] **Setup Tailwind CSS (if applicable for React Native):** Review `tailwind.config.ts` if a React Native-compatible Tailwind solution (like Nativewind) is to be used for styling, otherwise plan for StyleSheet or a styling library. *(Using StyleSheet with theme system instead)*
- [x] **Asset Management:**
    - [x] Organize new font files (if the design implies a different font than `SpaceMono-Regular.ttf`).
    - [x] Add new image assets (custom icons, backgrounds if any).

## 2. Core UI & Theming

- [x] **Define Color Palette:** Extract all colors from the design and define them in a central theme file (e.g., `mobile/constants/Colors.ts` or a new theme context).
- [x] **Typography:**
    - [x] Define font styles (sizes, weights, families) based on the design.
    - [x] Load custom fonts if new ones are introduced.
- [x] **Base Styling:** Establish base styles for common elements (text, views, buttons) to ensure consistency.
- [x] **Theme Context (Optional but Recommended):** Implement or update a ThemeContext to allow for dynamic theming (e.g., light/dark modes, though not explicitly shown, it's good practice). The existing `useThemeColor` hook might be a good starting point.

## 3. Reusable Component Development

Create these components to be highly customizable and reusable across different screens.

- [x] **Buttons:**
    - [x] Primary Button (e.g., "Set Mood", "Continue")
    - [x] Secondary/Link Button (e.g., "Audio Journal" link on recording screen)
    - [x] Icon Button (e.g., notification bell, back arrow)
    - [x] Toggle Buttons (for selecting causes, companions)
- [x] **Cards:**
    - [x] Base Card component for wrapping content sections.
    - [x] Stat Card (for "Most frequent emotion", "Journals written this month")
- [x] **Input Fields:**
    - [x] Text Input / Text Area (for "Enter additional note")
    - [x] Slider (for "Activity Level")
    - [x] Segmented Control / Number Picker (for "How long did you sleep", "Did you interact/socialize")
- [x] **Mood Selector:** Custom component for selecting mood with a slider and displaying the large mood face.
- [x] **Custom Header:** Reusable header component (e.g., with back button, title, right-side icons).
- [x] **Calendar View:** Component to display a monthly calendar with mood indicators.
- [x] **List Item Component:** For displaying items in lists (e.g., suggested locations).
- [x] **Loading/Spinner Component:** A generic loading indicator (can be simple or use Skia for a custom animation).

## 4. React Native Skia Component Development

These components will leverage `react-native-skia` for custom graphics.

- [x] **Bar Chart Component:** For "Journal Stats" screen (displaying mood distribution).
    - [x] Customizable bar colors, labels, and values.
    - [x] Animations for bars appearing.
- [x] **Horizontal Bar Component:** For "Most frequent emotion" card.
    - [x] Customizable colors, labels, and values.
- [x] **Audio Waveform Display:** For "Add Audio Journal" screen (visualizing audio input during recording).
    - [x] Real-time updates based on audio input.
- [x] **Custom Loading Animation:** For "Transcribing your audio..." screen (if a more complex animation than a simple spinner is desired).
- [x] **Mood Icons (Optional with Skia):** If mood icons have complex shapes or animations, consider drawing them with Skia. Otherwise, SVGs or static images are fine.

## 5. Screen Implementation

Redesign or create the following screens based on the new UI. Update Expo Router file structure as needed.

- [x] **(Tabs) Layout (`mobile/app/(tabs)/_layout.tsx`):**
    - [x] Update tab icons and labels if necessary to match the new design aesthetic.
    - [x] Ensure `HapticTab.tsx` is integrated if desired.
- [x] **Journal Stats Screen (e.g., `mobile/app/(tabs)/index.tsx` or a new `stats.tsx`):**
    - [x] Integrate Bar Chart component.
    - [x] Integrate "Most frequent emotion" card with Horizontal Bar component.
    - [x] Integrate "Journals written this month" card with Calendar View.
    - [x] Header with title and potentially a profile/settings icon.
- [x] **Add Audio Journal Flow:**
    - [x] **Initial Screen (e.g., `mobile/app/addAudioJournal.tsx`):**
        - [x] "Say anything that's on your mind!" prompt.
        - [x] Large microphone icon.
        - [x] "Ready?" button.
    - [x] **Recording Screen (same file or modal):**
        - [x] Integrate Audio Waveform Display (Skia).
        - [x] Implement recording controls (cancel, record/pause, confirm).
        - [x] Timer display.
        - [x] Link to "Audio Journal" (text instructions).
    - [x] **Transcribing Screen (same file or modal):**
        - [x] "Transcribing your audio..." message.
        - [x] Integrate custom Skia loading animation or a standard loader.
- [x] **Journal Entry View Screen (e.g., `mobile/app/journal/[id].tsx`):**
    - [x] Display date, mood, title, and entry content.
    - [x] Audio playback controls if it's an audio journal.
    - [x] Header with back button and potentially edit/delete options.
- [x] **Mood Check-in Flow (likely a new stack or series of modals, e.g., `mobile/app/checkin/...`):**
    - [x] **Step 1: How are you feeling?**
        - [x] Integrate Mood Selector component.
        - [x] "Set Mood" button.
    - [x] **Step 2: Why do you feel [mood]?**
        - [x] Dynamic title based on selected mood.
        - [x] Integrate Toggle Buttons for causes.
        - [x] Integrate Slider for Activity Level.
        - [x] Integrate input for sleep duration.
        - [x] Integrate input for social interaction.
        - [x] Integrate Text Area for additional notes.
        - [x] "Continue" button.
    - [x] **Step 3: Who are you currently with?**
        - [x] Integrate Toggle Buttons for companions.
        - [x] "Continue" button.
    - [x] **Step 4: Select Location (Optional):**
        - [x] Integrate `react-native-maps` or a simpler list-based location selector.
        - [x] UI for searching/selecting a location.
    - [x] **Step 5: Check In Completed:**
        - [x] Confirmation message.
        - [x] "Continue" button (navigates to journal or home).
- [x] **Authentication Screens (`mobile/app/auth.tsx`):**
    - [x] Update UI to match the new design language (if designs for these exist, otherwise adapt the style).
- [x] **Profile Page (e.g., `mobile/app/(tabs)/profile.tsx` or similar):**
    - [x] Design and implement based on any available profile screen mockups or adapt the overall style.
- [x] **Not Found Screen (`mobile/app/+not-found.tsx`):**
    - [x] Style to match the new design.

## 6. Navigation

- [x] **Review Expo Router Setup:** Ensure file-based routing in `mobile/app/` aligns with the new screen structure and flow.
- [x] **Implement Tab Navigation:** Update `(tabs)/_layout.tsx` with new icons and styles.
- [x] **Implement Stack Navigation:** For flows like Mood Check-in or navigating to specific journal entries. Expo Router handles this implicitly with directory structure.
- [x] **Modal Views:** Use modals for parts of the Audio Journal flow or Check-in flow if appropriate.

## 7. State Management & API Integration

- [x] **Authentication State:** Verify `AuthContext.tsx` (`mobile/contexts/AuthContext.tsx`) integrates well with the new UI.
- [x] **Journal Data Management:**
    - [x] Utilize TanStack Query (`mobile/lib/queryClient.ts`) for fetching and caching journal entries, stats.
    - [x] Define new query keys and mutation functions as needed for `mobile/lib/api.ts`.
- [x] **Mood Check-in State:** Manage state for the multi-step check-in flow (local component state, or a global state slice if data needs to persist across app sessions before submission).
- [x] **API Endpoints:**
    - [x] Ensure `mobile/lib/api.ts` has functions to interact with all necessary backend endpoints (fetching stats, submitting journal entries, mood check-ins, audio transcription requests).
    - [x] Update API calls to match any changes in the backend `server/` or `shared/schema.ts`.

## 8. Audio Features (using `expo-av`)

- [x] **Audio Recording:**
    - [x] Implement permission handling for microphone.
    - [x] Start, pause, stop recording.
    - [x] Get audio data for waveform visualization and for sending to backend.
- [x] **Audio Playback (for existing entries):**
    - [x] Load and play audio files.
    - [x] UI for playback controls (play, pause, seek).
- [x] **Audio Transcription:**
    - [x] Send recorded audio to the backend for transcription.
    - [x] Handle loading state while transcribing.
    - [x] Display transcribed text.

## 9. Polish & Testing

- [x] **Haptic Feedback:** Integrate `expo-haptics` for subtle feedback on interactions (button presses, selections).
- [x] **Animations:** Add subtle animations using `react-native-reanimated` to enhance user experience (screen transitions, component appearances).
- [x] **Accessibility (A11y):**
    - [x] Ensure proper labels for interactive elements.
    - [x] Test with screen readers.
    - [x] Ensure sufficient color contrast.
- [x] **Performance Testing:**
    - [x] Profile app performance, especially Skia components and lists.
    - [x] Optimize as needed.
- [x] **Cross-Platform Testing (iOS & Android):**
    - [x] Test thoroughly on both platforms and various device sizes.
- [x] **Error Handling:** Implement robust error handling for API calls and other operations.
- [x] **Code Review & Refactoring:** Clean up code, remove unused components/files, and ensure consistency.

This plan provides a comprehensive roadmap. Each major step can be broken down further into smaller tasks. Remember to commit changes frequently and test on actual devices when possible.
