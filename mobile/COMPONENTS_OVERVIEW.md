# Mobile App Components Overview

This document provides an overview of all the UI components created for the Artful Whispers mobile app redesign.

## Design System

### 🎨 Theme & Colors (`constants/Colors.ts`)
- Comprehensive color palette for light and dark modes
- Mood-specific colors for emotional tracking
- Semantic colors for success, warning, error states

### 📝 Typography (`constants/Typography.ts`)
- Consistent font sizes and weights
- Typography variants for headers, body text, captions, buttons
- Line height specifications

### 📏 Spacing (`constants/Spacing.ts`)
- Standardized spacing values
- Border radius definitions
- Shadow presets for depth

### 🎯 Theme Context (`contexts/ThemeContext.tsx`)
- Dynamic theme switching (light/dark/auto)
- Helper hooks for accessing theme values
- Persistent theme preferences

## UI Components

### Core Components (`components/ui/`)

#### 🔘 Button (`Button.tsx`)
- Multiple variants: primary, secondary, outline, ghost, link
- Different sizes: small, medium, large
- Loading states and haptic feedback
- Icon support

#### 🃏 Card (`Card.tsx`)
- Base card component with variants: default, elevated, outlined, flat
- StatCard specialized for displaying statistics
- Pressable card support

#### 📝 Input (`Input.tsx`)
- Text input with multiple variants: default, outlined, filled
- TextArea component for multi-line input
- Error states, helper text, icon support
- Password visibility toggle

#### 🎭 MoodSelector (`MoodSelector.tsx`)
- Interactive mood selection with slider
- Animated mood faces and colors
- Gesture-based interaction with haptic feedback
- Customizable mood options

#### 🎚️ Slider (`Slider.tsx`)
- Customizable range slider
- Animated interactions
- Configurable min/max/step values
- Custom value formatting

#### 🔄 ToggleButton (`ToggleButton.tsx`)
- Single and multi-select toggle buttons
- ToggleGroup for handling multiple selections
- Different variants: default, chip, pill
- Maximum selection limits

#### 🎛️ SegmentedControl (`SegmentedControl.tsx`)
- Animated segmented control
- NumberPicker for numeric selections
- SleepDurationPicker for sleep tracking
- SocialInteractionPicker for social metrics

#### ⏳ LoadingAnimation (`LoadingAnimation.tsx`)
- Multiple animation variants: spinner, dots, pulse, wave
- TranscribingAnimation for audio processing
- Customizable size and colors

#### 📱 Header (`Header.tsx`)
- Reusable header component with back button, title, right-side icons
- Multiple variants: default, large, minimal
- Navigation header, large header, minimal header specialized components
- Header action components (icon buttons, notification button)

#### 📅 Calendar (`Calendar.tsx`)
- Full calendar component with month navigation
- Mood indicators on dates
- CompactCalendar for stat cards
- Date selection functionality

#### 📋 ListItem (`ListItem.tsx`)
- Flexible list item component with multiple variants
- LocationListItem, SettingsListItem, SelectableListItem specialized components
- Section headers and separators
- Support for icons, subtitles, descriptions

### Skia Components (`components/skia/`)

#### 📊 BarChart (`BarChart.tsx`)
- Animated vertical bar charts for mood statistics
- HorizontalBarChart for emotion frequency display
- Customizable colors, labels, and animations
- Smooth transitions and interactions

#### 😊 MoodIcons (`MoodIcons.tsx`)
- Custom mood icons drawn with Skia
- Animated mood faces with different expressions
- MoodIconGrid for mood selection interfaces
- Preset mood icons (Happy, Sad, Angry, Anxious, Neutral)

### Audio Components (`components/audio/`)

#### 🌊 AudioWaveform (`AudioWaveform.tsx`)
- Real-time audio visualization during recording
- Animated waveform bars
- RecordingIndicator with pulse animation
- Recording duration display

## Usage Examples

### Basic Button Usage
```tsx
import { Button } from '@/components/ui';

<Button 
  title="Continue" 
  variant="primary" 
  size="large" 
  onPress={handleContinue}
/>
```

### Mood Selection
```tsx
import { MoodSelector } from '@/components/ui';

<MoodSelector
  onMoodChange={(mood) => setSelectedMood(mood)}
  initialMood={currentMood}
/>
```

### Statistics Display
```tsx
import { StatCard, BarChart } from '@/components/ui';

<StatCard
  title="Journals Written"
  value="24"
  subtitle="This month"
  trend={{ value: 12, isPositive: true }}
/>

<BarChart
  data={moodDistributionData}
  width={300}
  height={200}
/>
```

### Form Inputs
```tsx
import { Input, Slider, ToggleGroup } from '@/components/ui';

<Input
  label="Additional Notes"
  placeholder="Enter your thoughts..."
  multiline
/>

<Slider
  label="Activity Level"
  min={0}
  max={10}
  value={activityLevel}
  onValueChange={setActivityLevel}
/>

<ToggleGroup
  options={causeOptions}
  selectedIds={selectedCauses}
  onSelectionChange={setSelectedCauses}
  multiSelect
/>
```

## Theme Integration

All components are fully integrated with the theme system:

```tsx
import { useTheme, useColors } from '@/contexts/ThemeContext';

const { theme } = useTheme();
const colors = useColors();

// Access theme values
const buttonStyle = {
  backgroundColor: theme.colors.primary,
  padding: theme.spacing.md,
  borderRadius: theme.borderRadius.lg,
};
```

## Next Steps

1. **Screen Implementation**: Build the actual screens using these components
2. **Navigation Setup**: Configure Expo Router for the new flow
3. **State Management**: Implement data fetching and state management
4. **Audio Integration**: Connect audio recording and playback functionality
5. **Testing**: Test components on actual devices
6. **Performance Optimization**: Optimize animations and interactions

## Component Status

✅ **Completed**
- All core UI components
- Theme system and design tokens
- Skia-based charts and visualizations
- Audio waveform components
- Loading and animation components

🔄 **In Progress**
- Screen implementations
- Navigation setup
- API integration

📋 **Planned**
- Calendar component
- Custom header component
- List item components
- Profile components