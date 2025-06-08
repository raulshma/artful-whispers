import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";
import React from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

export default function BlurTabBarBackground() {
  const blurIntensity = useSharedValue(100);

  const animatedBlurStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(1, { duration: 200 }),
    };
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, animatedBlurStyle]}>
      <BlurView
        // System chrome material automatically adapts to the system's theme
        // and matches the native tab bar appearance on iOS.
        tint="systemChromeMaterial"
        intensity={blurIntensity.value}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
