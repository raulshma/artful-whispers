import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { SkiaLoadingAnimation } from "@/components/ui/SkiaLoadingAnimation";
import { useTheme } from "@/contexts/ThemeContext";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  variant?: "ripple" | "morphing" | "orbital" | "breathing";
  size?: number;
  color?: string;
  style?: ViewStyle;
  backgroundOpacity?: number;
}

export function LoadingOverlay({
  visible,
  message = "Loading...",
  variant = "ripple",
  size = 80,
  color,
  style,
  backgroundOpacity = 0.6,
}: LoadingOverlayProps) {
  const { theme } = useTheme();
  const animationColor = color || theme.colors.primary;

  const opacity = useSharedValue(visible ? 1 : 0);
  const scale = useSharedValue(visible ? 1 : 0);
  const textOpacity = useSharedValue(visible ? 1 : 0);

  React.useEffect(() => {
    if (visible) {
      // Show animation: background first, then content
      opacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });

      scale.value = withDelay(
        100,
        withTiming(1, {
          duration: 400,
          easing: Easing.elastic(1.2),
        })
      );

      textOpacity.value = withDelay(
        200,
        withTiming(1, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        })
      );
    } else {
      // Hide animation: content first, then background
      textOpacity.value = withTiming(0, {
        duration: 150,
        easing: Easing.in(Easing.cubic),
      });

      scale.value = withTiming(0, {
        duration: 200,
        easing: Easing.in(Easing.back(1.5)),
      });

      opacity.value = withDelay(
        100,
        withTiming(0, {
          duration: 200,
          easing: Easing.in(Easing.cubic),
        })
      );
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  if (!visible && opacity.value === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[styles.overlay, overlayStyle, style]}
      pointerEvents={visible ? "auto" : "none"}
    >
      <ThemedView
        style={[
          styles.background,
          {
            backgroundColor: theme.colors.background,
            opacity: backgroundOpacity,
          },
        ]}
      />

      <Animated.View style={[styles.content, contentStyle]}>
        <SkiaLoadingAnimation
          variant={variant}
          size={size}
          color={animationColor}
          visible={visible}
        />

        {message && (
          <Animated.Text
            style={[
              styles.message,
              {
                color: theme.colors.text,
                marginTop: theme.spacing.md,
              },
              textStyle,
            ]}
          >
            {message}
          </Animated.Text>
        )}
      </Animated.View>
    </Animated.View>
  );
}

// Enhanced version with multiple animation stages
export function EnhancedLoadingOverlay({
  visible,
  message = "Loading...",
  subMessage,
  variant = "ripple",
  size = 100,
  color,
  style,
  backgroundOpacity = 0.8,
}: LoadingOverlayProps & { subMessage?: string }) {
  const { theme } = useTheme();
  const animationColor = color || theme.colors.primary;

  const backgroundOpacityValue = useSharedValue(
    visible ? backgroundOpacity : 0
  );
  const contentScale = useSharedValue(visible ? 1 : 0);
  const contentOpacity = useSharedValue(visible ? 1 : 0);
  const messageTranslateY = useSharedValue(visible ? 0 : 20);
  const messageOpacity = useSharedValue(visible ? 1 : 0);

  React.useEffect(() => {
    if (visible) {
      // Staggered entrance animation
      backgroundOpacityValue.value = withTiming(backgroundOpacity, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });

      contentScale.value = withDelay(
        150,
        withTiming(1, {
          duration: 500,
          easing: Easing.elastic(1.1),
        })
      );

      contentOpacity.value = withDelay(
        150,
        withTiming(1, {
          duration: 400,
          easing: Easing.out(Easing.cubic),
        })
      );

      messageTranslateY.value = withDelay(
        300,
        withTiming(0, {
          duration: 400,
          easing: Easing.out(Easing.cubic),
        })
      );

      messageOpacity.value = withDelay(
        300,
        withTiming(1, {
          duration: 400,
          easing: Easing.out(Easing.cubic),
        })
      );
    } else {
      // Reverse exit animation
      messageOpacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.in(Easing.cubic),
      });

      messageTranslateY.value = withTiming(-10, {
        duration: 200,
        easing: Easing.in(Easing.cubic),
      });

      contentOpacity.value = withDelay(
        100,
        withTiming(0, {
          duration: 300,
          easing: Easing.in(Easing.cubic),
        })
      );

      contentScale.value = withDelay(
        100,
        withTiming(0.8, {
          duration: 300,
          easing: Easing.in(Easing.cubic),
        })
      );

      backgroundOpacityValue.value = withDelay(
        200,
        withTiming(0, {
          duration: 300,
          easing: Easing.in(Easing.cubic),
        })
      );
    }
  }, [visible]);

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacityValue.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: contentScale.value }],
    opacity: contentOpacity.value,
  }));

  const messageStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: messageTranslateY.value }],
    opacity: messageOpacity.value,
  }));

  if (!visible && backgroundOpacityValue.value === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[styles.overlay, style]}
      pointerEvents={visible ? "auto" : "none"}
    >
      <Animated.View
        style={[
          styles.background,
          { backgroundColor: theme.colors.background },
          backgroundStyle,
        ]}
      />

      <Animated.View style={[styles.enhancedContent, contentStyle]}>
        <SkiaLoadingAnimation
          variant={variant}
          size={size}
          color={animationColor}
          visible={visible}
        />

        <Animated.View style={[styles.messageContainer, messageStyle]}>
          {message && (
            <ThemedText
              style={[
                styles.primaryMessage,
                {
                  color: theme.colors.text,
                  fontSize: 18,
                  fontWeight: "600",
                },
              ]}
            >
              {message}
            </ThemedText>
          )}

          {subMessage && (
            <ThemedText
              style={[
                styles.subMessage,
                {
                  color: theme.colors.textSecondary,
                  fontSize: 14,
                  marginTop: theme.spacing.xs,
                },
              ]}
            >
              {subMessage}
            </ThemedText>
          )}
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  enhancedContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  message: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  messageContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  primaryMessage: {
    textAlign: "center",
  },
  subMessage: {
    textAlign: "center",
    lineHeight: 20,
  },
});

export default LoadingOverlay;
