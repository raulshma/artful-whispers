import React, { useState } from "react";
import {
  TextInput,
  TextInputProps,
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "default" | "outlined" | "filled";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  required?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = "outlined",
  size = "medium",
  fullWidth = true,
  containerStyle,
  inputStyle,
  labelStyle,
  required = false,
  multiline = false,
  secureTextEntry,
  ...props
}: InputProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const getSizeStyles = () => {
    const sizeMap = {
      small: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.sm,
        minHeight: 36,
        fontSize: theme.typography.captionSmall.fontSize,
      },
      medium: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        minHeight: 44,
        fontSize: theme.typography.body.fontSize,
      },
      large: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.lg,
        minHeight: 52,
        fontSize: theme.typography.bodyLarge.fontSize,
      },
    };
    return sizeMap[size];
  };

  const getInputContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: "row",
      alignItems: multiline ? "flex-start" : "center",
      borderRadius: theme.borderRadius.md,
      ...getSizeStyles(),
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {
        borderBottomWidth: 1,
        borderBottomColor: error
          ? theme.colors.semantic.error
          : isFocused
          ? theme.colors.primary
          : theme.colors.border,
        backgroundColor: "transparent",
      },
      outlined: {
        borderWidth: 1,
        borderColor: error
          ? theme.colors.semantic.error
          : isFocused
          ? theme.colors.primary
          : theme.colors.border,
        backgroundColor: theme.colors.surface,
      },
      filled: {
        backgroundColor: theme.colors.surfaceSecondary,
        borderWidth: 0,
        borderBottomWidth: 2,
        borderBottomColor: error
          ? theme.colors.semantic.error
          : isFocused
          ? theme.colors.primary
          : "transparent",
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  const getInputStyle = (): TextStyle => {
    return {
      flex: 1,
      color: theme.colors.text,
      fontSize: getSizeStyles().fontSize,
      paddingVertical: multiline ? theme.spacing.sm : 0,
      textAlignVertical: multiline ? "top" : "center",
    };
  };

  const renderPasswordToggle = () => {
    if (!secureTextEntry) return null;

    return (
      <TouchableOpacity
        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        style={{ marginLeft: theme.spacing.sm }}
      >
        <Text style={{ color: theme.colors.textSecondary }}>
          {isPasswordVisible ? "👁️" : "👁️‍🗨️"}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[{ width: fullWidth ? "100%" : "auto" }, containerStyle]}>
      {label && (
        <Text
          style={[
            theme.typography.label,
            {
              color: theme.colors.textSecondary,
              marginBottom: theme.spacing.xs,
            },
            labelStyle,
          ]}
        >
          {label}
          {required && (
            <Text style={{ color: theme.colors.semantic.error }}> *</Text>
          )}
        </Text>
      )}

      <View style={getInputContainerStyle()}>
        {leftIcon && (
          <View style={{ marginRight: theme.spacing.sm }}>{leftIcon}</View>
        )}

        <TextInput
          style={[getInputStyle(), inputStyle]}
          placeholderTextColor={theme.colors.textTertiary}
          selectionColor={theme.colors.primary}
          multiline={multiline}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {secureTextEntry && renderPasswordToggle()}

        {rightIcon && !secureTextEntry && (
          <View style={{ marginLeft: theme.spacing.sm }}>{rightIcon}</View>
        )}
      </View>

      {(error || helperText) && (
        <Text
          style={[
            theme.typography.captionSmall,
            {
              color: error
                ? theme.colors.semantic.error
                : theme.colors.textTertiary,
              marginTop: theme.spacing.xs,
            },
          ]}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

// Specialized TextArea component
export function TextArea(props: Omit<InputProps, "multiline">) {
  return <Input {...props} multiline={true} />;
}
