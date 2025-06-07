import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

interface AnimatedTabIndicatorProps {
  activeIndex: number;
  tabWidth: number;
  totalTabs: number;
}

export function AnimatedTabIndicator({ 
  activeIndex, 
  tabWidth, 
  totalTabs 
}: AnimatedTabIndicatorProps) {
  const { theme } = useTheme();
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.8);

  const triggerHaptics = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  useEffect(() => {
    const targetX = activeIndex * tabWidth;
    
    // Animate position with spring physics
    translateX.value = withSpring(targetX, {
      damping: 20,
      stiffness: 300,
      mass: 0.8,
    });

    // Add a subtle scale animation
    scale.value = withTiming(1.1, { duration: 100 }, () => {
      scale.value = withTiming(1, { duration: 200 });
    });

    // Opacity pulse
    opacity.value = withTiming(1, { duration: 150 }, () => {
      opacity.value = withTiming(0.8, { duration: 300 });
    });

    // Trigger haptic feedback
    runOnJS(triggerHaptics)();
  }, [activeIndex, tabWidth]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.indicator,
        {
          width: tabWidth * 0.6, // Slightly smaller than tab
          backgroundColor: theme.colors.primary,
        },
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    borderRadius: 1.5,
    alignSelf: 'center',
    marginLeft: '20%', // Center the indicator
  },
});
