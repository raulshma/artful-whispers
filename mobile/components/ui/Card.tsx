import React from "react";
import {
  View,
  ViewProps,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface BaseCardProps {
  variant?: "default" | "elevated" | "outlined" | "flat";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  margin?: "none" | "sm" | "md" | "lg" | "xl";
  borderRadius?: "none" | "sm" | "md" | "lg" | "xl" | "2xl";
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardProps
  extends BaseCardProps,
    Omit<ViewProps, "children" | "style"> {
  pressable?: false;
}

interface PressableCardProps
  extends BaseCardProps,
    Omit<TouchableOpacityProps, "style" | "children"> {
  pressable: true;
}

type CardComponentProps = CardProps | PressableCardProps;

export function Card({
  variant = "default",
  padding = "md",
  margin = "none",
  borderRadius = "lg",
  children,
  style,
  pressable,
  ...props
}: CardComponentProps) {
  const { theme } = useTheme();

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.card,
    };

    // Padding styles
    const paddingMap = {
      none: 0,
      sm: theme.spacing.sm,
      md: theme.spacing.md,
      lg: theme.spacing.lg,
      xl: theme.spacing.xl,
    };

    // Margin styles
    const marginMap = {
      none: 0,
      sm: theme.spacing.sm,
      md: theme.spacing.md,
      lg: theme.spacing.lg,
      xl: theme.spacing.xl,
    };

    // Border radius styles
    const borderRadiusMap = {
      none: theme.borderRadius.none,
      sm: theme.borderRadius.sm,
      md: theme.borderRadius.md,
      lg: theme.borderRadius.lg,
      xl: theme.borderRadius.xl,
      "2xl": theme.borderRadius["2xl"],
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      default: {
        ...theme.shadows.sm,
      },
      elevated: {
        ...theme.shadows.lg,
      },
      outlined: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
      },
      flat: {
        backgroundColor: theme.colors.surfaceSecondary,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      padding: paddingMap[padding],
      margin: marginMap[margin],
      borderRadius: borderRadiusMap[borderRadius],
    };
  };

  const cardStyle = [getCardStyle(), style];

  if (pressable) {
    return (
      <TouchableOpacity
        style={cardStyle}
        activeOpacity={0.7}
        {...(props as TouchableOpacityProps)}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} {...(props as ViewProps)}>
      {children}
    </View>
  );
}

// Specialized card components
export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  ...cardProps
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
} & Omit<CardComponentProps, "children">) {
  const { theme } = useTheme();

  return (
    <Card {...cardProps}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={[
              theme.typography.captionSmall,
              {
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.xs,
              },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              theme.typography.h3,
              { color: theme.colors.text, marginBottom: theme.spacing.xs },
            ]}
          >
            {value}
          </Text>
          {subtitle && (
            <Text
              style={[
                theme.typography.caption,
                { color: theme.colors.textTertiary },
              ]}
            >
              {subtitle}
            </Text>
          )}
          {trend && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: theme.spacing.xs,
              }}
            >
              <Text
                style={[
                  theme.typography.captionSmall,
                  {
                    color: trend.isPositive
                      ? theme.colors.semantic.success
                      : theme.colors.semantic.error,
                  },
                ]}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </Text>
            </View>
          )}
        </View>
        {icon && <View style={{ marginLeft: theme.spacing.md }}>{icon}</View>}
      </View>
    </Card>
  );
}
