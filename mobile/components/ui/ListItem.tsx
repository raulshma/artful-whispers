import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { IconSymbol } from "./IconSymbol";
import * as Haptics from "expo-haptics";

interface ListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  leftIcon?: string;
  rightIcon?: string;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  variant?: "default" | "compact" | "detailed";
  disabled?: boolean;
  selected?: boolean;
  hapticFeedback?: boolean;
}

export function ListItem({
  title,
  subtitle,
  description,
  leftIcon,
  rightIcon,
  leftComponent,
  rightComponent,
  onPress,
  style,
  titleStyle,
  subtitleStyle,
  variant = "default",
  disabled = false,
  selected = false,
  hapticFeedback = true,
}: ListItemProps) {
  const { theme } = useTheme();

  const handlePress = () => {
    if (disabled || !onPress) return;

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: selected ? theme.colors.primary + "10" : "transparent",
      opacity: disabled ? 0.5 : 1,
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        minHeight: 56,
      },
      compact: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.sm,
        minHeight: 44,
      },
      detailed: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.lg,
        minHeight: 72,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  const getTitleStyle = (): TextStyle => {
    const variantStyles: Record<string, TextStyle> = {
      default: theme.typography.body,
      compact: theme.typography.caption,
      detailed: theme.typography.bodyLarge,
    };

    return {
      ...variantStyles[variant],
      color: selected ? theme.colors.primary : theme.colors.text,
      fontWeight: selected ? "600" : "400",
    };
  };

  const getSubtitleStyle = (): TextStyle => {
    const variantStyles: Record<string, TextStyle> = {
      default: theme.typography.caption,
      compact: theme.typography.captionSmall,
      detailed: theme.typography.caption,
    };

    return {
      ...variantStyles[variant],
      color: theme.colors.textSecondary,
      marginTop: 2,
    };
  };

  const getDescriptionStyle = (): TextStyle => ({
    ...theme.typography.captionSmall,
    color: theme.colors.textTertiary,
    marginTop: 4,
    lineHeight: 16,
  });

  const renderLeftContent = () => {
    if (leftComponent) {
      return <View style={styles.leftContent}>{leftComponent}</View>;
    }

    if (leftIcon) {
      return (
        <View style={styles.leftContent}>
          <IconSymbol
            name={leftIcon}
            size={variant === "compact" ? 20 : 24}
            color={selected ? theme.colors.primary : theme.colors.textSecondary}
          />
        </View>
      );
    }

    return null;
  };

  const renderRightContent = () => {
    if (rightComponent) {
      return <View style={styles.rightContent}>{rightComponent}</View>;
    }

    if (rightIcon) {
      return (
        <View style={styles.rightContent}>
          <IconSymbol
            name={rightIcon}
            size={variant === "compact" ? 16 : 20}
            color={theme.colors.textTertiary}
          />
        </View>
      );
    }

    return null;
  };

  const content = (
    <View style={[getContainerStyle(), style]}>
      {renderLeftContent()}

      <View style={styles.textContent}>
        <Text style={[getTitleStyle(), titleStyle]} numberOfLines={1}>
          {title}
        </Text>

        {subtitle && (
          <Text style={[getSubtitleStyle(), subtitleStyle]} numberOfLines={1}>
            {subtitle}
          </Text>
        )}

        {description && variant === "detailed" && (
          <Text style={getDescriptionStyle()} numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>

      {renderRightContent()}
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

// Specialized list item components
export function LocationListItem({
  title,
  subtitle,
  distance,
  onPress,
  selected,
  ...props
}: Omit<ListItemProps, "leftIcon" | "rightComponent"> & {
  distance?: string;
}) {
  return (
    <ListItem
      title={title}
      subtitle={subtitle}
      leftIcon="location"
      rightComponent={
        distance ? (
          <Text style={{ fontSize: 12, color: "#666" }}>{distance}</Text>
        ) : undefined
      }
      onPress={onPress}
      selected={selected}
      {...props}
    />
  );
}

export function SettingsListItem({
  title,
  subtitle,
  leftIcon,
  onPress,
  showChevron = true,
  ...props
}: Omit<ListItemProps, "rightIcon"> & {
  showChevron?: boolean;
}) {
  return (
    <ListItem
      title={title}
      subtitle={subtitle}
      leftIcon={leftIcon}
      rightIcon={showChevron ? "chevron.right" : undefined}
      onPress={onPress}
      {...props}
    />
  );
}

export function SelectableListItem({
  title,
  subtitle,
  selected,
  onPress,
  ...props
}: Omit<ListItemProps, "rightComponent">) {
  const { theme } = useTheme();

  return (
    <ListItem
      title={title}
      subtitle={subtitle}
      rightComponent={
        selected ? (
          <IconSymbol
            name="checkmark.circle.fill"
            size={20}
            color={theme.colors.primary}
          />
        ) : (
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: theme.colors.border,
            }}
          />
        )
      }
      onPress={onPress}
      selected={selected}
      {...props}
    />
  );
}

// Section header for grouped lists
export function ListSectionHeader({
  title,
  style,
}: {
  title: string;
  style?: ViewStyle;
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.sectionHeader, style]}>
      <Text
        style={[
          styles.sectionHeaderText,
          { color: theme.colors.textSecondary },
        ]}
      >
        {title.toUpperCase()}
      </Text>
    </View>
  );
}

// Separator for list items
export function ListSeparator({
  style,
  inset = false,
}: {
  style?: ViewStyle;
  inset?: boolean;
}) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.separator,
        {
          backgroundColor: theme.colors.border,
          marginLeft: inset ? theme.spacing.xl : 0,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  leftContent: {
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  rightContent: {
    marginLeft: 12,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingTop: 16,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  separator: {
    height: 1,
  },
});
