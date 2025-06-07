import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

interface ToggleButtonProps {
  title: string;
  selected?: boolean;
  onPress: () => void;
  variant?: 'default' | 'chip' | 'pill';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticFeedback?: boolean;
}

export function ToggleButton({
  title,
  selected = false,
  onPress,
  variant = 'default',
  size = 'medium',
  icon,
  disabled = false,
  style,
  textStyle,
  hapticFeedback = true,
}: ToggleButtonProps) {
  const { theme } = useTheme();

  const handlePress = () => {
    if (disabled) return;
    
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        minHeight: 32,
      },
      medium: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        minHeight: 40,
      },
      large: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        minHeight: 48,
      },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      default: {
        borderRadius: theme.borderRadius.md,
      },
      chip: {
        borderRadius: theme.borderRadius.lg,
      },
      pill: {
        borderRadius: theme.borderRadius.full,
      },
    };

    // Selection and state styles
    const stateStyle: ViewStyle = selected
      ? {
          backgroundColor: theme.colors.primary,
          borderColor: theme.colors.primary,
        }
      : {
          backgroundColor: 'transparent',
          borderColor: theme.colors.border,
        };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...stateStyle,
      opacity: disabled ? 0.5 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles: Record<string, TextStyle> = {
      small: theme.typography.captionSmall,
      medium: theme.typography.caption,
      large: theme.typography.body,
    };

    return {
      ...sizeStyles[size],
      color: selected ? '#FFFFFF' : theme.colors.text,
      fontWeight: selected ? '600' : '400',
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon && (
        <View style={{ marginRight: title ? theme.spacing.xs : 0 }}>
          {icon}
        </View>
      )}
      {title && (
        <Text style={[getTextStyle(), textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// Multi-select toggle group component
interface ToggleGroupProps {
  options: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  multiSelect?: boolean;
  variant?: 'default' | 'chip' | 'pill';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  buttonStyle?: ViewStyle;
  maxSelections?: number;
}

export function ToggleGroup({
  options,
  selectedIds,
  onSelectionChange,
  multiSelect = true,
  variant = 'chip',
  size = 'medium',
  style,
  buttonStyle,
  maxSelections,
}: ToggleGroupProps) {
  const { theme } = useTheme();

  const handleToggle = (id: string) => {
    let newSelectedIds: string[];

    if (multiSelect) {
      if (selectedIds.includes(id)) {
        // Remove from selection
        newSelectedIds = selectedIds.filter(selectedId => selectedId !== id);
      } else {
        // Add to selection (check max limit)
        if (maxSelections && selectedIds.length >= maxSelections) {
          return; // Don't allow more selections
        }
        newSelectedIds = [...selectedIds, id];
      }
    } else {
      // Single select
      newSelectedIds = selectedIds.includes(id) ? [] : [id];
    }

    onSelectionChange(newSelectedIds);
  };

  return (
    <View style={[
      {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
      },
      style
    ]}>
      {options.map((option) => (
        <ToggleButton
          key={option.id}
          title={option.label}
          icon={option.icon}
          selected={selectedIds.includes(option.id)}
          onPress={() => handleToggle(option.id)}
          variant={variant}
          size={size}
          style={buttonStyle}
        />
      ))}
    </View>
  );
}