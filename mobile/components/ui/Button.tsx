import React from "react";
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import * as Haptics from "expo-haptics";

interface ButtonProps extends Omit<TouchableOpacityProps, "style"> {
  title: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticFeedback?: boolean;
}

export function Button({
  title,
  variant = "primary",
  size = "medium",
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  textStyle,
  hapticFeedback = true,
  disabled,
  onPress,
  ...props
}: ButtonProps) {
  const { theme } = useTheme();

  const handlePress = (event: any) => {
    if (hapticFeedback && !disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (onPress && !disabled && !loading) {
      onPress(event);
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.borderRadius.lg,
      ...theme.shadows.sm,
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        minHeight: 36,
      },
      medium: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        minHeight: 44,
      },
      large: {
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.lg,
        minHeight: 52,
      },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: disabled
          ? theme.colors.textTertiary
          : theme.colors.primary,
      },
      secondary: {
        backgroundColor: disabled
          ? theme.colors.backgroundTertiary
          : theme.colors.secondary,
        borderWidth: 1,
        borderColor: theme.colors.border,
      },
      outline: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: disabled
          ? theme.colors.textTertiary
          : theme.colors.primary,
      },
      ghost: {
        backgroundColor: "transparent",
      },
      link: {
        backgroundColor: "transparent",
        paddingHorizontal: 0,
        paddingVertical: 0,
        minHeight: "auto" as any,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth && { width: "100%" }),
      opacity: disabled || loading ? 0.6 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles: Record<string, TextStyle> = {
      small: theme.typography.buttonSmall,
      medium: theme.typography.button,
      large: theme.typography.buttonLarge,
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: {
        color: "#FFFFFF",
      },
      secondary: {
        color: theme.colors.text,
      },
      outline: {
        color: disabled ? theme.colors.textTertiary : theme.colors.primary,
      },
      ghost: {
        color: theme.colors.text,
      },
      link: {
        color: theme.colors.primary,
        textDecorationLine: "underline",
      },
    };

    return {
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "#FFFFFF" : theme.colors.primary}
        />
      ) : (
        <>
          {leftIcon}
          <Text
            style={[
              getTextStyle(),
              textStyle,
              leftIcon ? { marginLeft: theme.spacing.sm } : undefined,
            ]}
          >
            {title}
          </Text>
          {rightIcon && (
            <View style={{ marginLeft: theme.spacing.sm }}>{rightIcon}</View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
