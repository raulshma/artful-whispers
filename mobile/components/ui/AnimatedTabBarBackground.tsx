import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

interface AnimatedTabBarBackgroundProps {
  activeIndex: number;
  totalTabs: number;
}

export function AnimatedTabBarBackground({ activeIndex, totalTabs }: AnimatedTabBarBackgroundProps) {
  const { theme } = useTheme();
  const indicatorPosition = useSharedValue(0);
  const backgroundOpacity = useSharedValue(0.9);

  useEffect(() => {
    indicatorPosition.value = withTiming(activeIndex, { duration: 300 });
    backgroundOpacity.value = withTiming(0.95, { duration: 200 });
  }, [activeIndex]);

  const indicatorStyle = useAnimatedStyle(() => {
    const translateX = (indicatorPosition.value / totalTabs) * 100;
    
    return {
      transform: [{ translateX: `${translateX}%` }],
    };
  });

  const backgroundStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      backgroundOpacity.value,
      [0, 1],
      [theme.colors.surface + '80', theme.colors.surface + 'F0']
    );

    return {
      backgroundColor,
    };
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, backgroundStyle]}>
      <Animated.View 
        style={[
          styles.indicator,
          indicatorStyle,
          { 
            backgroundColor: theme.colors.primary + '20',
            width: `${100 / totalTabs}%`,
          }
        ]} 
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    top: 0,
    height: 3,
    borderRadius: 1.5,
  },
});
