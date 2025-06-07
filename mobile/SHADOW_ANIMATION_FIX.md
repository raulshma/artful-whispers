# Shadow Animation Fix Documentation

## Problem
Elements with shadows (Cards, panels, stats components) were experiencing visual artifacts during tab transitions. The shadows would flicker, animate improperly, or create a poor visual effect when opacity and other properties were animated.

## Root Cause
- React Native shadows don't animate smoothly when opacity is animated
- Shadow properties get recalculated during animations, causing flicker
- iOS and Android handle shadow rasterization differently during transforms

## Solution Implementation

### 1. ShadowFriendlyAnimation Component
Created `mobile/components/ui/ShadowFriendlyAnimation.tsx` specifically for shadowed elements:

**Features:**
- **Transform-only animations**: Uses only `translateY` and `scale` transforms
- **No opacity animations**: Prevents shadow flickering by avoiding opacity changes
- **Reduced movement distance**: Smaller transforms (15px vs 30px) for subtler effects
- **Platform-specific rasterization**: Uses `shouldRasterizeIOS` and `renderToHardwareTextureAndroid`
- **Staggered animations**: Supports index-based delays for sequential element animations

**Animation Types:**
- `slideUp`: Subtle upward slide with spring physics
- `scaleIn`: Gentle scale animation from 0.98 to 1.0

### 2. Updated Components
Modified both stats and profile pages to use shadow-friendly animations:

**Stats Page (`index.tsx`):**
- `JournalStats` component wrapped with `ShadowFriendlyAnimation`
- `MoodStatsCard` component wrapped with `ShadowFriendlyAnimation`
- `MoodCalendar` component wrapped with `ShadowFriendlyAnimation`

**Profile Page (`profile.tsx`):**
- Profile header card wrapped with `ShadowFriendlyAnimation`
- Stats overview card wrapped with `ShadowFriendlyAnimation`
- Settings card wrapped with `ShadowFriendlyAnimation`
- Account card wrapped with `ShadowFriendlyAnimation`

### 3. Enhanced AnimatedPageWrapper
Added platform-specific rasterization hints to the main page wrapper:
- iOS: `shouldRasterizeIOS: true` with `rasterizationScale: 2`
- Android: `renderToHardwareTextureAndroid: true`

## Technical Details

### Animation Configuration
```typescript
// Subtle movements to reduce shadow artifacts
const translateY = useSharedValue(15); // Small movement
const scale = useSharedValue(0.98);    // Minimal scale change

// Spring configuration optimized for smooth shadows
withSpring(0, { 
  damping: 20, 
  stiffness: 400,
  mass: 0.6 
})
```

### Platform Optimizations
```typescript
// iOS optimization
shouldRasterizeIOS: true,
rasterizationScale: 2,

// Android optimization  
renderToHardwareTextureAndroid: true,
```

### Staggered Timing
```typescript
const staggerDelay = delay + (index * 60); // 60ms between elements
```

## Components Affected
All shadowed components now use shadow-friendly animations:
- `Card` component (uses `theme.shadows.sm`, `theme.shadows.lg`)
- `JournalStats` (uses `theme.shadows.md`)
- `MoodStatsCard` (uses `theme.shadows.md`)
- `MoodCalendar` (uses `theme.shadows.md`)

## Result
- ✅ Smooth tab transitions without shadow artifacts
- ✅ Polished, subtle animations that don't distract
- ✅ Consistent animation timing across all shadowed elements
- ✅ Platform-optimized performance for both iOS and Android
- ✅ Maintains visual hierarchy while providing smooth feedback

## Usage Guidelines

### For New Shadowed Components
```typescript
// Wrap shadowed elements with ShadowFriendlyAnimation
<ShadowFriendlyAnimation index={0} animationType="slideUp">
  <Card>
    {/* Your content */}
  </Card>
</ShadowFriendlyAnimation>
```

### For Non-Shadowed Components
```typescript
// Use regular StaggeredAnimation for elements without shadows
<StaggeredAnimation index={0} animationType="slideUp">
  <View>
    {/* Your content */}
  </View>
</StaggeredAnimation>
```

## Performance Benefits
- Reduced GPU usage by avoiding opacity animations on shadowed elements
- Better frame rates during transitions
- Smoother visual experience across different devices
- Optimized shadow rendering through rasterization hints
