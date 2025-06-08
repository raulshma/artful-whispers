# Mobile UI Components

## Design System

### Theme & Colors (`constants/Colors.ts`)
- Comprehensive color palette for light and dark modes
- Mood-specific colors for emotional tracking
- Semantic colors for success, warning, error states

### Typography (`constants/Typography.ts`)
- Font sizes and weights
- Typography variants for headers, body text, captions, buttons
- Line height specifications

### Spacing (`constants/Spacing.ts`)
- Standardized spacing values
- Border radius definitions
- Shadow presets for depth

## Core Components

### Button (`components/ui/Button.tsx`)
```typescript
import { Button } from '@/components/ui';

<Button 
  title="Continue" 
  variant="primary" // 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'
  size="large" // 'small' | 'medium' | 'large'
  onPress={handleContinue}
/>
```

**Features:**
- Multiple variants: primary, secondary, outline, ghost, link
- Different sizes: small, medium, large
- Loading states and haptic feedback
- Icon support

### Card (`components/ui/Card.tsx`)
- Base card component with variants: default, elevated, outlined, flat
- StatCard specialized for displaying statistics
- Pressable card support

### Input (`components/ui/Input.tsx`)
```typescript
import { Input } from '@/components/ui';

<Input
  label="Additional Notes"
  placeholder="Enter your thoughts..."
  multiline
  error={error}
  helperText="Optional details about your mood"
/>
```

**Features:**
- Text input with multiple variants: default, outlined, filled
- TextArea component for multi-line input
- Error states, helper text, icon support
- Password visibility toggle

### MoodSelector (`components/ui/MoodSelector.tsx`)
```typescript
import { MoodSelector } from '@/components/ui';

<MoodSelector
  onMoodChange={(mood) => setSelectedMood(mood)}
  initialMood={currentMood}
/>
```

**Features:**
- Interactive mood selection with slider
- Animated mood faces and colors
- Gesture-based interaction with haptic feedback
- Customizable mood options

### Slider (`components/ui/Slider.tsx`)
```typescript
import { Slider } from '@/components/ui';

<Slider
  label="Activity Level"
  min={0}
  max={10}
  value={activityLevel}
  onValueChange={setActivityLevel}
/>
```

**Features:**
- Customizable range slider
- Animated interactions
- Configurable min/max/step values
- Custom value formatting

### ToggleButton (`components/ui/ToggleButton.tsx`)
```typescript
import { ToggleGroup } from '@/components/ui';

<ToggleGroup
  options={causeOptions}
  selectedIds={selectedCauses}
  onSelectionChange={setSelectedCauses}
  multiSelect
/>
```

**Features:**
- Single and multi-select toggle buttons
- ToggleGroup for handling multiple selections
- Different variants: default, chip, pill
- Maximum selection limits

### SegmentedControl (`components/ui/SegmentedControl.tsx`)
- Animated segmented control
- NumberPicker for numeric selections
- SleepDurationPicker for sleep tracking
- SocialInteractionPicker for social metrics

### Header (`components/ui/Header.tsx`)
- Reusable header component with back button, title, right-side icons
- Multiple variants: default, large, minimal
- Navigation header, large header, minimal header specialized components
- Header action components (icon buttons, notification button)

### Calendar (`components/ui/Calendar.tsx`)
- Full calendar component with month navigation
- Mood indicators on dates
- CompactCalendar for stat cards
- Date selection functionality

### ListItem (`components/ui/ListItem.tsx`)
- Flexible list item component with multiple variants
- LocationListItem, SettingsListItem, SelectableListItem specialized components
- Section headers and separators
- Support for icons, subtitles, descriptions

## Skia Components

### BarChart (`components/skia/BarChart.tsx`)
```typescript
import { BarChart } from '@/components/skia';

<BarChart
  data={moodDistributionData}
  width={300}
  height={200}
/>
```

**Features:**
- Animated vertical bar charts for mood statistics
- HorizontalBarChart for emotion frequency display
- Customizable colors, labels, and animations
- Smooth transitions and interactions

### MoodIcons (`components/skia/MoodIcons.tsx`)
- Custom mood icons drawn with Skia
- Animated mood faces with different expressions
- MoodIconGrid for mood selection interfaces
- Preset mood icons (Happy, Sad, Angry, Anxious, Neutral)

### AudioWaveform (`components/audio/AudioWaveform.tsx`)
- Real-time audio visualization during recording
- Animated waveform bars
- RecordingIndicator with pulse animation
- Recording duration display

## Theme Integration

```typescript
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

**Features:**
- Dynamic theme switching (light/dark/auto)
- Helper hooks for accessing theme values
- Persistent theme preferences