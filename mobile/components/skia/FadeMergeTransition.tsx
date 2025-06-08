import React, { useEffect } from "react";
import { Dimensions, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { useTheme } from "@/contexts/ThemeContext";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface FadeMergeTransitionProps {
  isTransitioning: boolean;
  onTransitionComplete: () => void;
}

export function FadeMergeTransition({
  isTransitioning,
  onTransitionComplete,
}: FadeMergeTransitionProps) {
  const { theme } = useTheme();

  const overlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (isTransitioning) {
      // Simple fade in and out
      overlayOpacity.value = withTiming(1, { duration: 300 }, (finished) => {
        if (finished) {
          overlayOpacity.value = withTiming(
            0,
            { duration: 300 },
            (finished) => {
              if (finished) {
                runOnJS(onTransitionComplete)();
              }
            }
          );
        }
      });
    }
  }, [isTransitioning, onTransitionComplete]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  if (!isTransitioning) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          backgroundColor: theme.colors.background,
        },
        overlayStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
});
