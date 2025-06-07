import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';

interface AnimatedPageWrapperProps {
  children: React.ReactNode;
  animationType?: 'fadeIn' | 'slideUp' | 'scaleIn' | 'slideFromRight';
  delay?: number;
}

export function AnimatedPageWrapper({ 
  children, 
  animationType = 'slideUp',
  delay = 0 
}: AnimatedPageWrapperProps) {
  const opacity = useSharedValue(1); // Start visible to avoid shadow transitions
  const translateY = useSharedValue(30);
  const translateX = useSharedValue(50);
  const scale = useSharedValue(0.95);

  useFocusEffect(
    React.useCallback(() => {
      // Reset animation values when page comes into focus
      opacity.value = 1; // Keep opacity at 1 to prevent shadow fading
      translateY.value = 30;
      translateX.value = 50;
      scale.value = 0.95;

      // Start animations with delay
      const timer = setTimeout(() => {
        switch (animationType) {
          case 'fadeIn':
            // For fadeIn, we'll use a minimal opacity change
            opacity.value = 0.85;
            opacity.value = withTiming(1, { duration: 400 });
            break;
          case 'slideUp':
            // Only animate transform, keep opacity constant
            translateY.value = withSpring(0, { 
              damping: 20, 
              stiffness: 300,
              mass: 0.8
            });
            break;
          case 'scaleIn':
            // Only animate scale, keep opacity constant
            scale.value = withSpring(1, { 
              damping: 15, 
              stiffness: 400 
            });
            break;
          case 'slideFromRight':
            // Only animate transform, keep opacity constant
            translateX.value = withSpring(0, { 
              damping: 18, 
              stiffness: 350 
            });
            break;
        }
      }, delay);

      return () => {
        clearTimeout(timer);
        // Don't reset opacity to prevent shadow flicker
      };
    }, [animationType, delay])
  );
  const animatedStyle = useAnimatedStyle(() => {
    let transform = [];

    if (animationType === 'slideUp') {
      transform.push({ translateY: translateY.value });
    } else if (animationType === 'scaleIn') {
      transform.push({ scale: scale.value });
    } else if (animationType === 'slideFromRight') {
      transform.push({ translateX: translateX.value });
    }    return {
      opacity: opacity.value,
      transform,
      // Prevent shadow animation artifacts with platform-specific hints
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
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
