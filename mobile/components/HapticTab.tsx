import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

export function HapticTab(props: BottomTabBarButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(props.accessibilityState?.selected ? 1 : 0.7);
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Animate based on selected state
    if (props.accessibilityState?.selected) {
      scale.value = withSpring(1.1, { damping: 15, stiffness: 400 });
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(-2, { damping: 15, stiffness: 400 });
    } else {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      opacity.value = withTiming(0.7, { duration: 200 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 400 });
    }
  }, [props.accessibilityState?.selected]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
      ],
      opacity: opacity.value,
    };
  });

  const handlePressIn = (ev: any) => {
    // Add press animation
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
    
    if (process.env.EXPO_OS === 'ios') {
      // Add a soft haptic feedback when pressing down on the tabs.
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    props.onPressIn?.(ev);
  };

  const handlePressOut = (ev: any) => {
    // Return to normal or selected state
    if (props.accessibilityState?.selected) {
      scale.value = withSpring(1.1, { damping: 15, stiffness: 400 });
    } else {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    }
    props.onPressOut?.(ev);
  };

  return (
    <Animated.View style={animatedStyle}>
      <PlatformPressable
        {...props}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      />
    </Animated.View>
  );
}
