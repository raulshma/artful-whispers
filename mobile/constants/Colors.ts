/**
 * Color palette for the Artful Whispers mobile app
 * Based on modern mood tracking and journal app design principles
 */

// Primary brand colors
const primaryBlue = '#4A90E2';
const primaryBlueDark = '#357ABD';

// Mood colors for emotional tracking
const moodColors = {
  happy: '#FFD93D',
  excited: '#FF6B6B',
  calm: '#4ECDC4',
  sad: '#74B9FF',
  anxious: '#FD79A8',
  angry: '#E17055',
  neutral: '#95A5A6',
};

// Semantic colors
const semanticColors = {
  success: '#00B894',
  warning: '#FDCB6E',
  error: '#E74C3C',
  info: '#74B9FF',
};

export const Colors = {
  light: {
    // Primary colors
    primary: primaryBlue,
    primaryDark: primaryBlueDark,
    secondary: '#F8F9FA',
    
    // Text colors
    text: '#2D3436',
    textSecondary: '#636E72',
    textTertiary: '#95A5A6',
    
    // Background colors
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FA',
    backgroundTertiary: '#E9ECEF',
    
    // Surface colors
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F3F4',
    
    // Border colors
    border: '#E9ECEF',
    borderSecondary: '#DEE2E6',
    
    // Component colors
    card: '#FFFFFF',
    cardSecondary: '#F8F9FA',
    
    // Tab colors
    tint: primaryBlue,
    icon: '#95A5A6',
    tabIconDefault: '#95A5A6',
    tabIconSelected: primaryBlue,
    
    // Mood colors
    mood: moodColors,
    
    // Semantic colors
    semantic: semanticColors,
  },
  dark: {
    // Primary colors
    primary: '#5BA3F5',
    primaryDark: '#4A90E2',
    secondary: '#2D3436',
    
    // Text colors
    text: '#FFFFFF',
    textSecondary: '#B2BEC3',
    textTertiary: '#95A5A6',
    
    // Background colors
    background: '#1A1A1A',
    backgroundSecondary: '#2D3436',
    backgroundTertiary: '#363A3D',
    
    // Surface colors
    surface: '#2D3436',
    surfaceSecondary: '#363A3D',
    
    // Border colors
    border: '#4A4A4A',
    borderSecondary: '#5A5A5A',
    
    // Component colors
    card: '#2D3436',
    cardSecondary: '#363A3D',
    
    // Tab colors
    tint: '#5BA3F5',
    icon: '#95A5A6',
    tabIconDefault: '#95A5A6',
    tabIconSelected: '#5BA3F5',
    
    // Mood colors (slightly adjusted for dark mode)
    mood: {
      ...moodColors,
      happy: '#F1C40F',
      excited: '#E55656',
      calm: '#45B7B8',
      sad: '#6C5CE7',
      anxious: '#E84393',
      angry: '#E17055',
      neutral: '#95A5A6',
    },
    
    // Semantic colors
    semantic: semanticColors,
  },
};

// Export individual color sets for easy access
export const MoodColors = moodColors;
export const SemanticColors = semanticColors;
