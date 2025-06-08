import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";

interface StaggeredAnimationProps {
  children: React.ReactNode;
  index: number;
  animationType?: "slideUp" | "fadeIn" | "scaleIn";
  delay?: number;
  duration?: number;
}

export function StaggeredAnimation({
  children,
  index,
  animationType = "slideUp",
  delay = 0,
  duration = 400,
}: StaggeredAnimationProps) {
  const opacity = useSharedValue(1); // Start visible to avoid shadow transitions
  const translateY = useSharedValue(20); // Reduce initial offset
  const scale = useSharedValue(0.95);

  useFocusEffect(
    React.useCallback(() => {
      // Reset animation values with minimal opacity change
      opacity.value = 1;
      translateY.value = 20; // Smaller initial offset
      scale.value = 0.95;

      // Calculate staggered delay
      const staggerDelay = delay + index * 80; // Slightly faster stagger

      // Start animations with staggered timing
      if (animationType === "slideUp") {
        // Only animate transform to avoid shadow issues
        translateY.value = withDelay(
          staggerDelay,
          withSpring(0, {
            damping: 18,
            stiffness: 350,
            mass: 0.7,
          })
        );
      } else if (animationType === "fadeIn") {
        // Minimal opacity animation
        opacity.value = 0.9;
        opacity.value = withDelay(
          staggerDelay,
          withTiming(1, { duration: duration * 0.6 })
        );
      } else if (animationType === "scaleIn") {
        // Only animate scale
        scale.value = withDelay(
          staggerDelay,
          withSpring(1, {
            damping: 15,
            stiffness: 450,
          })
        );
      }

      return () => {
        // Don't reset opacity to prevent shadow flicker
      };
    }, [index, animationType, delay, duration])
  );
  const animatedStyle = useAnimatedStyle(() => {
    let transform = [];

    if (animationType === "slideUp") {
      transform.push({ translateY: translateY.value });
    } else if (animationType === "scaleIn") {
      transform.push({ scale: scale.value });
    }

    return {
      opacity: opacity.value,
      transform,
      // Prevent shadow animation artifacts
      shouldRasterizeIOS: true,
      renderToHardwareTextureAndroid: true,
    };
  });

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
