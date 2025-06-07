/**
 * Typography system for the Artful Whispers mobile app
 * Defines font sizes, weights, and line heights for consistency
 */

export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
} as const;

export const FontWeights = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const LineHeights = {
  xs: 16,
  sm: 20,
  base: 24,
  lg: 28,
  xl: 28,
  '2xl': 32,
  '3xl': 36,
  '4xl': 40,
  '5xl': 56,
  '6xl': 72,
} as const;

export const Typography = {
  // Headers
  h1: {
    fontSize: FontSizes['4xl'],
    fontWeight: FontWeights.bold,
    lineHeight: LineHeights['4xl'],
  },
  h2: {
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.bold,
    lineHeight: LineHeights['3xl'],
  },
  h3: {
    fontSize: FontSizes['2xl'],
    fontWeight: FontWeights.semibold,
    lineHeight: LineHeights['2xl'],
  },
  h4: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semibold,
    lineHeight: LineHeights.xl,
  },
  h5: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.medium,
    lineHeight: LineHeights.lg,
  },
  h6: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium,
    lineHeight: LineHeights.base,
  },

  // Body text
  body: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.normal,
    lineHeight: LineHeights.base,
  },  bodyLarge: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.normal,
    lineHeight: LineHeights.lg,
  },
  bodyMedium: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium,
    lineHeight: LineHeights.base,
  },
  bodySmall: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.normal,
    lineHeight: LineHeights.sm,
  },

  // Captions and labels
  caption: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.normal,
    lineHeight: LineHeights.sm,
  },
  captionSmall: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.normal,
    lineHeight: LineHeights.xs,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    lineHeight: LineHeights.sm,
  },
  labelLarge: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.medium,
    lineHeight: LineHeights.base,
  },

  // Buttons
  button: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    lineHeight: LineHeights.base,
  },
  buttonLarge: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    lineHeight: LineHeights.lg,
  },
  buttonSmall: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    lineHeight: LineHeights.sm,
  },

  // Tab bar
  tabLabel: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
    lineHeight: LineHeights.xs,
  },
} as const;

export type TypographyVariant = keyof typeof Typography;