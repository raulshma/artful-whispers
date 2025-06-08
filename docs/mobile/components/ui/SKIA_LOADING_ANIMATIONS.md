# Skia Loading Animations

This project now includes visually appealing 2D loading animations using React Native Skia, designed to replace traditional loading spinners with seamless hide/show transitions.

## Features

- **4 Beautiful Animation Variants**: Ripple, Morphing, Orbital, and Breathing animations
- **Seamless Transitions**: Smooth show/hide animations with elastic and timing-based easing
- **High Performance**: Hardware-accelerated animations using React Native Skia
- **Customizable**: Size, color, and visibility control
- **Easy Integration**: Drop-in replacement for existing loading components

## Components

### SkiaLoadingAnimation

The main component that provides four different animation variants.

```tsx
import { SkiaLoadingAnimation } from '@/components/ui';

<SkiaLoadingAnimation
  variant="ripple"
  size={80}
  color="#007AFF"
  visible={true}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'ripple' \| 'morphing' \| 'orbital' \| 'breathing'` | `'ripple'` | Animation variant to display |
| `size` | `number` | `80` | Size of the animation |
| `color` | `string` | `theme.colors.primary` | Color of the animation |
| `visible` | `boolean` | `true` | Controls visibility with smooth transitions |
| `style` | `ViewStyle` | `undefined` | Additional styling |

#### Animation Variants

1. **Ripple** (`'ripple'`): Expanding concentric circles with staggered timing
2. **Morphing** (`'morphing'`): Shape-shifting organic blob with gradient and blur effects
3. **Orbital** (`'orbital'`): Particles orbiting around a central core
4. **Breathing** (`'breathing'`): Pulsing concentric circles with opacity variations

### LoadingAnimation (Enhanced)

The existing LoadingAnimation component now supports Skia variants through prefixed names.

```tsx
import { LoadingAnimation } from '@/components/ui';

// Use Skia variants
<LoadingAnimation variant="skia-ripple" size={60} visible={true} />
<LoadingAnimation variant="skia-morphing" size={60} visible={true} />
<LoadingAnimation variant="skia-orbital" size={60} visible={true} />
<LoadingAnimation variant="skia-breathing" size={60} visible={true} />

// Standard variants still available
<LoadingAnimation variant="spinner" size={60} visible={true} />
<LoadingAnimation variant="dots" size={60} visible={true} />
```

### LoadingOverlay

A full-screen overlay component with enhanced animations and seamless transitions.

```tsx
import { LoadingOverlay, EnhancedLoadingOverlay } from '@/components/LoadingOverlay';

// Basic overlay
<LoadingOverlay
  visible={isLoading}
  message="Loading your entries..."
  variant="ripple"
  size={80}
/>

// Enhanced overlay with sub-message
<EnhancedLoadingOverlay
  visible={isLoading}
  message="Loading your entries..."
  subMessage="This might take a moment..."
  variant="morphing"
  size={100}
  backgroundOpacity={0.8}
/>
```

#### LoadingOverlay Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | `boolean` | Required | Controls overlay visibility |
| `message` | `string` | `'Loading...'` | Main loading message |
| `variant` | Animation variant | `'ripple'` | Skia animation variant |
| `size` | `number` | `80` | Animation size |
| `color` | `string` | `theme.colors.primary` | Animation color |
| `backgroundOpacity` | `number` | `0.6` | Background overlay opacity |
| `style` | `ViewStyle` | `undefined` | Additional styling |

## Animation Details

### Seamless Transitions

All animations feature carefully crafted show/hide transitions:

- **Show Animation**: Background fades in → Content scales up with elastic easing → Text appears
- **Hide Animation**: Text fades out → Content scales down → Background fades out
- **Timing**: Staggered delays create natural, fluid motion

### Performance Considerations

- Uses React Native Skia for hardware acceleration
- Leverages React Native Reanimated for smooth transitions
- Optimized re-renders with `useDerivedValue` for Skia value bridging
- Conditional rendering when `visible={false}` and animations complete

## Integration Examples

### Replace Standard ActivityIndicator

**Before:**
```tsx
{isLoading && (
  <ActivityIndicator size="large" color={theme.colors.primary} />
)}
```

**After:**
```tsx
<SkiaLoadingAnimation
  variant="ripple"
  size={60}
  color={theme.colors.primary}
  visible={isLoading}
/>
```

### Full-Screen Loading

**Before:**
```tsx
{isLoading && (
  <View style={styles.overlay}>
    <ActivityIndicator size="large" />
    <Text>Loading...</Text>
  </View>
)}
```

**After:**
```tsx
<LoadingOverlay
  visible={isLoading}
  message="Loading your content..."
  variant="breathing"
/>
```

### List Footer Loading

**Before:**
```tsx
const renderFooter = () => (
  <View style={styles.footer}>
    <ActivityIndicator />
    <Text>Loading more...</Text>
  </View>
);
```

**After:**
```tsx
const renderFooter = () => (
  <View style={styles.footer}>
    <SkiaLoadingAnimation variant="breathing" size={40} visible={true} />
    <Text>Loading more...</Text>
  </View>
);
```

## Best Practices

### Variant Selection

- **Ripple**: Great for initial page loads, data fetching
- **Morphing**: Perfect for creative/artistic apps, photo processing
- **Orbital**: Ideal for scientific/technical apps, complex operations
- **Breathing**: Excellent for meditation/wellness apps, gentle loading

### Sizing Guidelines

- **Small** (30-40px): List items, buttons, inline elements
- **Medium** (60-80px): Cards, modals, standard loading
- **Large** (100-120px): Full-screen overlays, major operations

### Color Coordination

```tsx
// Use theme colors for consistency
const { theme } = useTheme();

<SkiaLoadingAnimation
  color={theme.colors.primary}  // Primary actions
  color={theme.colors.accent}   // Secondary actions
  color={theme.colors.success}  // Success states
/>
```

### Visibility Management

```tsx
const [isLoading, setIsLoading] = useState(false);

// Proper loading state management
const handleSubmit = async () => {
  setIsLoading(true);
  try {
    await submitData();
  } finally {
    // Delay hide for smooth transition
    setTimeout(() => setIsLoading(false), 300);
  }
};

<SkiaLoadingAnimation visible={isLoading} />
```

## Demo Component

Use `SkiaLoadingDemo` to explore all variants interactively:

```tsx
import { SkiaLoadingDemo } from '@/components/ui/SkiaLoadingDemo';

// In your screen or component
<SkiaLoadingDemo />
```

## Dependencies

- `@shopify/react-native-skia`: Skia rendering engine
- `react-native-reanimated`: Animation library
- `react-native`: Core framework

## Migration Guide

### From ActivityIndicator

1. Replace `ActivityIndicator` imports with `SkiaLoadingAnimation`
2. Add `visible` prop for show/hide control
3. Choose appropriate variant for your use case
4. Adjust size (Skia animations are typically larger)

### From Custom Spinners

1. Remove custom rotation/scale animations
2. Replace with appropriate Skia variant
3. Use built-in `visible` prop instead of conditional rendering
4. Leverage seamless transitions for better UX

## Troubleshooting

### Performance Issues
- Ensure Skia is properly configured in your project
- Avoid rendering too many animations simultaneously
- Use `visible={false}` to completely hide unused animations

### Animation Not Showing
- Check that `visible={true}` is set
- Verify Skia dependencies are installed
- Ensure component has proper size allocation

### Transition Issues
- Allow time for animations to complete before hiding
- Use state management to control visibility properly
- Check that parent components aren't interfering with animations

## Future Enhancements

- Additional animation variants (wave, pulse, spiral)
- Custom path-based animations
- Sound integration for accessibility
- Dark/light mode automatic color adaptation
- Performance profiling and optimization tools