import React, { useEffect, useState } from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import {
  Canvas,
  Circle,
  LinearGradient,
  vec,
  Path,
  Skia,
  Group,
} from "@shopify/react-native-skia";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  runOnJS,
  useDerivedValue,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { IconSymbol } from "./IconSymbol";
import { useTheme } from "@/contexts/ThemeContext";
import { TabParticleSystem } from "./TabParticleSystem";

interface FloatingTabButtonProps {
  icon: string;
  label: string;
  isActive: boolean;
  onPress: () => void;
  color: string;
  activeColor: string;
}

const BUTTON_SIZE = 44;
const RIPPLE_SIZE = 60;

export function FloatingTabButton({
  icon,
  label,
  isActive,
  onPress,
  color,
  activeColor,
}: FloatingTabButtonProps) {
  const { theme } = useTheme();

  // Animation values
  const scale = useSharedValue(1);
  const iconScale = useSharedValue(1);
  const opacity = useSharedValue(isActive ? 1 : 0.7);
  const translateY = useSharedValue(0);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  // Particle system state
  const [particleTrigger, setParticleTrigger] = useState(false);
  // Derived values for Skia
  const skiaRippleScale = useDerivedValue(
    () => rippleScale.value * (RIPPLE_SIZE / 2)
  );
  const skiaRippleOpacity = useDerivedValue(() => rippleOpacity.value);
  const skiaGlowOpacity = useDerivedValue(() => glowOpacity.value);

  useEffect(() => {
    if (isActive) {
      // Active state animations
      scale.value = withSpring(1.05, { damping: 15, stiffness: 400 });
      iconScale.value = withSpring(1.1, { damping: 15, stiffness: 400 });
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(-2, { damping: 15, stiffness: 400 });
      glowOpacity.value = withTiming(0.6, { duration: 300 });

      // Subtle pulse animation for active tab
      pulseScale.value = withSequence(
        withTiming(1.02, { duration: 800 }),
        withTiming(1, { duration: 800 })
      );
    } else {
      // Inactive state animations
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      iconScale.value = withSpring(1, { damping: 15, stiffness: 400 });
      opacity.value = withTiming(0.7, { duration: 200 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 400 });
      glowOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isActive]);

  const handlePressIn = () => {
    // Press animation
    scale.value = withSpring(0.92, { damping: 15, stiffness: 500 });
    iconScale.value = withSpring(0.9, { damping: 15, stiffness: 500 });

    // Ripple effect
    rippleScale.value = 0;
    rippleOpacity.value = 0.3;
    rippleScale.value = withTiming(1, { duration: 400 });
    rippleOpacity.value = withTiming(0, { duration: 400 });

    if (process.env.EXPO_OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    if (isActive) {
      scale.value = withSpring(1.05, { damping: 15, stiffness: 400 });
      iconScale.value = withSpring(1.1, { damping: 15, stiffness: 400 });
    } else {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      iconScale.value = withSpring(1, { damping: 15, stiffness: 400 });
    }
  };
  const handlePress = () => {
    if (!isActive) {
      // Trigger particle explosion
      setParticleTrigger(true);
      setTimeout(() => setParticleTrigger(false), 100);

      // Success haptic for tab switch
      if (process.env.EXPO_OS === "ios") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
    onPress();
  };
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const currentColor = isActive ? activeColor : color;
  const iconSize = isActive ? 26 : 24;
  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Particle System - positioned absolutely behind the button */}
      <View style={styles.particleContainer}>
        <TabParticleSystem
          width={RIPPLE_SIZE}
          height={RIPPLE_SIZE}
          trigger={particleTrigger}
          centerX={RIPPLE_SIZE / 2}
          centerY={RIPPLE_SIZE / 2}
          color={activeColor}
        />
      </View>

      {/* Skia Canvas for visual effects - positioned absolutely behind the button */}
      <View style={styles.effectsContainer}>
        <Canvas style={styles.canvas}>
          <Group>
            {/* Ripple effect */}
            <Circle
              cx={BUTTON_SIZE / 2}
              cy={BUTTON_SIZE / 2}
              r={skiaRippleScale}
              opacity={skiaRippleOpacity}
              color={activeColor + "40"}
            />

            {/* Glow effect for active tab */}
            {isActive && (
              <Circle
                cx={BUTTON_SIZE / 2}
                cy={BUTTON_SIZE / 2}
                r={22}
                opacity={skiaGlowOpacity}
              >
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec(BUTTON_SIZE, BUTTON_SIZE)}
                  colors={[
                    activeColor + "20",
                    activeColor + "10",
                    activeColor + "05",
                  ]}
                />
              </Circle>
            )}
          </Group>
        </Canvas>
      </View>

      {/* Button content - positioned above the effects */}
      <Pressable
        style={styles.button}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        <Animated.View style={[styles.buttonContent, pulseStyle]}>
          <Animated.View style={[styles.iconContainer, iconStyle]}>
            <IconSymbol
              name={icon as any}
              size={iconSize}
              color={currentColor}
            />
          </Animated.View>
          <Text
            style={[
              styles.label,
              {
                color: currentColor,
                fontWeight: isActive ? "600" : "500",
              },
            ]}
          >
            {label}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  particleContainer: {
    position: "absolute",
    width: RIPPLE_SIZE,
    height: RIPPLE_SIZE,
    top: -8,
    left: -8,
    zIndex: 1,
  },
  effectsContainer: {
    position: "absolute",
    width: RIPPLE_SIZE,
    height: RIPPLE_SIZE,
    top: -8,
    left: -8,
    zIndex: 2,
  },
  canvas: {
    width: RIPPLE_SIZE,
    height: RIPPLE_SIZE,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
    minWidth: BUTTON_SIZE,
    zIndex: 3,
  },
  buttonContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 2,
  },
});
