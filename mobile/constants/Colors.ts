/**
 * Color palette for the Artful Whispers mobile app
 * Based on modern mood tracking and journal app design principles
 * Updated to match the green-themed UI design
 */

// Primary brand colors (Updated to green theme)
const primaryGreen = "#8DB596";
const primaryGreenDark = "#7A9F83";
const accentGreen = "#9BC53D";

// Mood colors for emotional tracking (Updated to match design)
const moodColors = {
  happy: "#9BC53D", // Bright green for happiness
  excited: "#FFB347", // Orange for excitement
  calm: "#8DB596", // Sage green for calm
  sad: "#6B9BD1", // Blue for sadness
  anxious: "#E17055", // Orange-red for anxiety
  angry: "#E74C3C", // Red for anger
  neutral: "#95A5A6", // Gray for neutral
  positive: "#8DB596", // Main green for positive moods
  negative: "#E17055", // Orange-red for negative moods
  skipped: "#8B4513", // Brown for skipped entries
};

// Semantic colors
const semanticColors = {
  success: "#00B894",
  warning: "#FDCB6E",
  error: "#E74C3C",
  info: "#74B9FF",
};

export const Colors = {
  light: {
    // Primary colors (Updated to green theme)
    primary: primaryGreen,
    primaryDark: primaryGreenDark,
    secondary: "#F8F9FA",
    accent: accentGreen,

    // Text colors
    text: "#2D3436",
    textSecondary: "#636E72",
    textTertiary: "#95A5A6",

    // Background colors
    background: "#FFFFFF",
    backgroundSecondary: "#F8F9FA",
    backgroundTertiary: "#E9ECEF",
    backgroundGreen: "#F0F5F0", // Light green background

    // Surface colors
    surface: "#FFFFFF",
    surfaceSecondary: "#F1F3F4",

    // Border colors
    border: "#E9ECEF",
    borderSecondary: "#DEE2E6",

    // Component colors
    card: "#FFFFFF",
    cardSecondary: "#F8F9FA",

    // Tab colors
    tint: primaryGreen,
    icon: "#95A5A6",
    tabIconDefault: "#95A5A6",
    tabIconSelected: primaryGreen,

    // Mood colors
    mood: moodColors,

    // Semantic colors
    semantic: semanticColors,
  },
  dark: {
    // Primary colors (Updated to green theme)
    primary: "#9BC53D",
    primaryDark: primaryGreen,
    secondary: "#2D3436",
    accent: accentGreen,

    // Text colors
    text: "#FFFFFF",
    textSecondary: "#B2BEC3",
    textTertiary: "#95A5A6",

    // Background colors
    background: "#1A1A1A",
    backgroundSecondary: "#2D3436",
    backgroundTertiary: "#363A3D",
    backgroundGreen: "#2A3A2A", // Dark green background

    // Surface colors
    surface: "#2D3436",
    surfaceSecondary: "#363A3D",

    // Border colors
    border: "#4A4A4A",
    borderSecondary: "#5A5A5A",

    // Component colors
    card: "#2D3436",
    cardSecondary: "#363A3D",

    // Tab colors
    tint: "#9BC53D",
    icon: "#95A5A6",
    tabIconDefault: "#95A5A6",
    tabIconSelected: "#9BC53D",

    // Mood colors (adjusted for dark mode)
    mood: {
      ...moodColors,
      happy: "#9BC53D",
      excited: "#FFB347",
      calm: "#8DB596",
      sad: "#6B9BD1",
      anxious: "#E17055",
      angry: "#E74C3C",
      neutral: "#95A5A6",
      positive: "#9BC53D",
      negative: "#E17055",
      skipped: "#8B4513",
    },

    // Semantic colors
    semantic: semanticColors,
  },
};

// Export individual color sets for easy access
export const MoodColors = moodColors;
export const SemanticColors = semanticColors;
