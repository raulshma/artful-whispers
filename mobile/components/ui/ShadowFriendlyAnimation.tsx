import React, { useEffect } from 'react';
import { View, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';

/**
 * ShadowFriendlyAnimation - A specialized animation wrapper for elements with shadows
 * 
 * This component provides smooth animations without animating opacity or other properties 
 * that cause shadow flickering or visual artifacts. Perfect for Card components and other
 * shadowed elements that need to animate smoothly during tab transitions.
 * 
 * Features:
 * - Transform-only animations (translateY, scale) to avoid shadow artifacts
 * - Reduced movement distance and scale changes for subtle, polished effects
 * - Platform-specific rasterization hints for optimal shadow rendering
 * - Staggered timing support for sequential element animations
 */

interface ShadowFriendlyAnimationProps {
  children: React.ReactNode;
  index: number;
  animationType?: 'slideUp' | 'scaleIn';
  delay?: number;
  duration?: number;
}

export function ShadowFriendlyAnimation({ 
  children, 
  index, 
  animationType = 'slideUp',
  delay = 0,
  duration = 400 
}: ShadowFriendlyAnimationProps) {
  const translateY = useSharedValue(15); // Smaller movement to reduce shadow artifacts
  const scale = useSharedValue(0.98); // Minimal scale change

  useFocusEffect(
    React.useCallback(() => {
      // Reset animation values with minimal changes
      translateY.value = 15;
      scale.value = 0.98;

      // Calculate staggered delay
      const staggerDelay = delay + (index * 60);

      // Start animations with staggered timing
      if (animationType === 'slideUp') {
        translateY.value = withDelay(
          staggerDelay, 
          withSpring(0, { 
            damping: 20, 
            stiffness: 400,
            mass: 0.6 
          })
        );
      } else if (animationType === 'scaleIn') {
        scale.value = withDelay(
          staggerDelay, 
          withSpring(1, { 
            damping: 18, 
            stiffness: 450,
            mass: 0.6 
          })
        );
      }

      return () => {
        // No cleanup needed to avoid shadow flicker
      };
    }, [index, animationType, delay, duration])
  );
  const animatedStyle = useAnimatedStyle(() => {
    let transform = [];

    if (animationType === 'slideUp') {
      transform.push({ translateY: translateY.value });
    } else if (animationType === 'scaleIn') {
      transform.push({ scale: scale.value });
    }

    return {
      transform,
      // No opacity changes to prevent shadow animations
      // Add rasterization hints for better shadow performance
      ...(Platform.OS === 'ios' && {
        shouldRasterizeIOS: true,
        rasterizationScale: 2,
      }),
      ...(Platform.OS === 'android' && {
        renderToHardwareTextureAndroid: true,
      }),
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
}
