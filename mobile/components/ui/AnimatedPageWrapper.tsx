import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
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
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const translateX = useSharedValue(50);
  const scale = useSharedValue(0.95);

  useFocusEffect(
    React.useCallback(() => {
      // Reset animation values when page comes into focus
      opacity.value = 0;
      translateY.value = 30;
      translateX.value = 50;
      scale.value = 0.95;

      // Start animations with delay
      const timer = setTimeout(() => {
        switch (animationType) {
          case 'fadeIn':
            opacity.value = withTiming(1, { duration: 400 });
            break;
          case 'slideUp':
            opacity.value = withTiming(1, { duration: 400 });
            translateY.value = withSpring(0, { 
              damping: 20, 
              stiffness: 300,
              mass: 0.8
            });
            break;
          case 'scaleIn':
            opacity.value = withTiming(1, { duration: 300 });
            scale.value = withSpring(1, { 
              damping: 15, 
              stiffness: 400 
            });
            break;
          case 'slideFromRight':
            opacity.value = withTiming(1, { duration: 350 });
            translateX.value = withSpring(0, { 
              damping: 18, 
              stiffness: 350 
            });
            break;
        }
      }, delay);

      return () => {
        clearTimeout(timer);
        // Reset to invisible when losing focus
        opacity.value = withTiming(0, { duration: 200 });
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
    }

    return {
      opacity: opacity.value,
      transform,
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
