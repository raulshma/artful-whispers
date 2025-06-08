# Tab Switching Animations - Mobile App

This document outlines the tab switching animations and transitions that have been added to the mobile app.

## Features Added

### 1. Enhanced Tab Button Animations (HapticTab.tsx)
- **Scale animation**: Tabs grow slightly when selected and shrink when pressed
- **Opacity transitions**: Smooth fade between active/inactive states
- **Translate animation**: Subtle upward movement for active tabs
- **Haptic feedback**: Light vibration on iOS when tabs are pressed
- **Spring physics**: Natural bouncing motion for better feel

### 2. Page Transition Animations (AnimatedPageWrapper.tsx)
- **Four animation types**:
  - `slideUp`: Content slides up from bottom with fade-in
  - `fadeIn`: Simple opacity fade-in
  - `scaleIn`: Content scales from 95% to 100% with fade-in
  - `slideFromRight`: Content slides in from the right side

### 3. Staggered Content Animations (StaggeredAnimation.tsx)
- **Sequential card reveals**: Cards appear one after another with 100ms delays
- **Three animation types**: slideUp, fadeIn, scaleIn
- **Automatic timing**: Based on component index for natural flow
- **Focus-aware**: Resets when navigating between tabs

### 4. Tab Bar Enhancements
- **Enhanced shadows**: Better depth and visual separation
- **Blur effects**: iOS-style transparency and blur
- **Icon scaling**: Active tab icons are slightly larger (26px vs 24px)
- **Better typography**: Improved font weights and spacing

### 5. Per-Tab Animation Types
- **Journal**: `slideFromRight` - Slides content from right
- **Stats**: `slideUp` - Cards slide up from bottom with staggered timing
- **Check In**: `scaleIn` - Content scales in with spring physics
- **Profile**: `fadeIn` - Simple fade-in effect

## File Structure

```
mobile/components/
├── HapticTab.tsx                    # Enhanced tab button with animations
├── ui/
│   ├── AnimatedPageWrapper.tsx      # Page-level transition wrapper
│   ├── StaggeredAnimation.tsx       # Sequential card animations
│   ├── AnimatedTabBarBackground.tsx # Tab bar background animations
│   └── AnimatedTabIndicator.tsx     # Tab indicator animations
└── ...

mobile/app/(tabs)/
├── _layout.tsx                      # Tab layout with enhanced styling
├── index.tsx                        # Stats page with staggered animations
├── journal.tsx                      # Journal page with slide animation
├── checkin.tsx                      # Check-in page with scale animation
└── profile.tsx                      # Profile page with fade animation
```

## Animation Configuration

### Timing and Easing
- **Duration**: 300-400ms for most transitions
- **Spring damping**: 15-20 for natural bounce
- **Spring stiffness**: 300-400 for responsiveness
- **Stagger delay**: 100ms between sequential elements

### Performance Optimizations
- Uses `react-native-reanimated` for 60fps animations
- Animations run on the UI thread
- Proper cleanup when components unmount
- Focus-aware resets to prevent animation conflicts

## User Experience Benefits

1. **Visual Continuity**: Smooth transitions maintain context
2. **Feedback**: Users know when navigation is happening
3. **Polish**: Professional feel with spring physics
4. **Accessibility**: Haptic feedback for iOS users
5. **Performance**: Hardware-accelerated animations

## Implementation Notes

- All animations use `react-native-reanimated` for performance
- Haptic feedback is iOS-only using `expo-haptics`
- Animations are focus-aware and reset properly
- Staggered animations create engaging content reveals
- Tab bar styling adapts to platform (iOS vs Android)
