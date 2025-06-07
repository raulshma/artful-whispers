import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';

interface StaggeredAnimationProps {
  children: React.ReactNode;
  index: number;
  animationType?: 'slideUp' | 'fadeIn' | 'scaleIn';
  delay?: number;
  duration?: number;
}

export function StaggeredAnimation({ 
  children, 
  index, 
  animationType = 'slideUp',
  delay = 0,
  duration = 400 
}: StaggeredAnimationProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.9);

  useFocusEffect(
    React.useCallback(() => {
      // Reset animation values
      opacity.value = 0;
      translateY.value = 30;
      scale.value = 0.9;

      // Calculate staggered delay
      const staggerDelay = delay + (index * 100);

      // Start animations with staggered timing
      if (animationType === 'slideUp') {
        opacity.value = withDelay(staggerDelay, withTiming(1, { duration }));
        translateY.value = withDelay(
          staggerDelay, 
          withSpring(0, { 
            damping: 15, 
            stiffness: 300,
            mass: 0.8 
          })
        );
      } else if (animationType === 'fadeIn') {
        opacity.value = withDelay(staggerDelay, withTiming(1, { duration }));
      } else if (animationType === 'scaleIn') {
        opacity.value = withDelay(staggerDelay, withTiming(1, { duration: duration * 0.8 }));
        scale.value = withDelay(
          staggerDelay, 
          withSpring(1, { 
            damping: 12, 
            stiffness: 400 
          })
        );
      }

      return () => {
        // Reset to invisible when losing focus
        opacity.value = withTiming(0, { duration: 200 });
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
      opacity: opacity.value,
      transform,
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
}
