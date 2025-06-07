import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  useDerivedValue,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

interface SegmentedControlOption {
  id: string;
  label: string;
  value: any;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  selectedId?: string;
  onSelectionChange: (option: SegmentedControlOption) => void;
  style?: ViewStyle;
  disabled?: boolean;
  hapticFeedback?: boolean;
}

export function SegmentedControl({
  options,
  selectedId,
  onSelectionChange,
  style,
  disabled = false,
  hapticFeedback = true,
}: SegmentedControlProps) {
  const { theme } = useTheme();
  const selectedIndex = options.findIndex(option => option.id === selectedId);
  const translateX = useSharedValue(0);

  const segmentWidth = useDerivedValue(() => {
    return 100 / options.length;
  });

  React.useEffect(() => {
    if (selectedIndex >= 0) {
      translateX.value = withSpring(selectedIndex * (100 / options.length));
    }
  }, [selectedIndex, options.length]);

  const handlePress = (option: SegmentedControlOption) => {
    if (disabled || option.id === selectedId) return;
    
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onSelectionChange(option);
  };

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: `${translateX.value}%` }],
      width: `${segmentWidth.value}%`,
    };
  });

  const getContainerStyle = (): ViewStyle => ({
    flexDirection: 'row',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.lg,
    padding: 2,
    position: 'relative',
    opacity: disabled ? 0.5 : 1,
  });

  const getSegmentStyle = (isSelected: boolean): ViewStyle => ({
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    minHeight: 40,
  });

  const getTextStyle = (isSelected: boolean): TextStyle => ({
    ...theme.typography.label,
    color: isSelected ? theme.colors.primary : theme.colors.textSecondary,
    fontWeight: isSelected ? '600' : '400',
  });

  return (
    <View style={[getContainerStyle(), style]}>
      {/* Selected indicator */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 2,
            bottom: 2,
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.md,
            ...theme.shadows.sm,
          },
          indicatorStyle,
        ]}
      />
      
      {/* Segments */}
      {options.map((option) => {
        const isSelected = option.id === selectedId;
        return (
          <TouchableOpacity
            key={option.id}
            style={getSegmentStyle(isSelected)}
            onPress={() => handlePress(option)}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Text style={getTextStyle(isSelected)}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Number picker component using segmented control
interface NumberPickerProps {
  min: number;
  max: number;
  step?: number;
  value?: number;
  onValueChange: (value: number) => void;
  label?: string;
  suffix?: string;
  style?: ViewStyle;
  disabled?: boolean;
}

export function NumberPicker({
  min,
  max,
  step = 1,
  value,
  onValueChange,
  label,
  suffix = '',
  style,
  disabled = false,
}: NumberPickerProps) {
  const { theme } = useTheme();

  const options: SegmentedControlOption[] = [];
  for (let i = min; i <= max; i += step) {
    options.push({
      id: i.toString(),
      label: `${i}${suffix}`,
      value: i,
    });
  }

  const handleSelectionChange = (option: SegmentedControlOption) => {
    onValueChange(option.value);
  };

  return (
    <View style={style}>
      {label && (
        <Text style={[
          theme.typography.label,
          { 
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.sm,
          }
        ]}>
          {label}
        </Text>
      )}
      <SegmentedControl
        options={options}
        selectedId={value?.toString()}
        onSelectionChange={handleSelectionChange}
        disabled={disabled}
      />
    </View>
  );
}

// Sleep duration picker (specialized number picker)
export function SleepDurationPicker({
  value,
  onValueChange,
  style,
  disabled = false,
}: {
  value?: number;
  onValueChange: (hours: number) => void;
  style?: ViewStyle;
  disabled?: boolean;
}) {
  return (
    <NumberPicker
      min={0}
      max={12}
      step={1}
      value={value}
      onValueChange={onValueChange}
      label="How long did you sleep?"
      suffix="h"
      style={style}
      disabled={disabled}
    />
  );
}

// Social interaction picker
export function SocialInteractionPicker({
  value,
  onValueChange,
  style,
  disabled = false,
}: {
  value?: boolean;
  onValueChange: (interacted: boolean) => void;
  style?: ViewStyle;
  disabled?: boolean;
}) {
  const { theme } = useTheme();

  const options: SegmentedControlOption[] = [
    { id: 'no', label: 'No', value: false },
    { id: 'yes', label: 'Yes', value: true },
  ];

  const handleSelectionChange = (option: SegmentedControlOption) => {
    onValueChange(option.value);
  };

  const selectedId = value === true ? 'yes' : value === false ? 'no' : undefined;

  return (
    <View style={style}>
      <Text style={[
        theme.typography.label,
        { 
          color: theme.colors.textSecondary,
          marginBottom: theme.spacing.sm,
        }
      ]}>
        Did you interact/socialize?
      </Text>
      <SegmentedControl
        options={options}
        selectedId={selectedId}
        onSelectionChange={handleSelectionChange}
        disabled={disabled}
      />
    </View>
  );
}