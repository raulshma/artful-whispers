import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import {
  Canvas,
  RoundedRect,
  LinearGradient,
  vec,
  Circle,
  Group,
  RadialGradient,
  Blur,
} from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  useDerivedValue,
  withTiming,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

interface DynamicTabBackgroundProps {
  activeIndex: number;
  totalTabs: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function DynamicTabBackground({ activeIndex, totalTabs }: DynamicTabBackgroundProps) {
  const { theme } = useTheme();
  
  const animatedIndex = useSharedValue(0);
  const glowIntensity = useSharedValue(0.1);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    animatedIndex.value = withSpring(activeIndex, { damping: 20, stiffness: 300 });
    
    // Subtle glow pulse on tab change
    glowIntensity.value = withTiming(0.3, { duration: 300 });
    setTimeout(() => {
      glowIntensity.value = withTiming(0.1, { duration: 800 });
    }, 300);

    // Subtle scale pulse
    pulseScale.value = withSpring(1.01, { damping: 15, stiffness: 400 });
    setTimeout(() => {
      pulseScale.value = withSpring(1, { damping: 15, stiffness: 400 });
    }, 200);
  }, [activeIndex]);  // Dynamic colors based on active tab
  const tabColors = [
    theme.colors.primary,           // Journal
    theme.colors.mood.happy,        // Stats
    theme.colors.mood.excited,      // Check In
    theme.colors.mood.calm,         // Profile
  ];

  const currentThemeColor = useDerivedValue(() => {
    const index = Math.round(animatedIndex.value);
    return tabColors[index] || theme.colors.primary;
  });
  const glowOpacity = useDerivedValue(() => glowIntensity.value);
  const backgroundOpacity = useDerivedValue(() => 0.05 + glowIntensity.value * 0.1);
  
  // Create gradient positions based on active tab
  const gradientCenter = useDerivedValue(() => {
    const tabWidth = screenWidth / totalTabs;
    const centerX = (animatedIndex.value + 0.5) * tabWidth;
    return { x: centerX, y: screenHeight * 0.8 };
  });
  const gradientCenterX = useDerivedValue(() => gradientCenter.value.x);
  const gradientCenterY = useDerivedValue(() => gradientCenter.value.y);
  const gradientCenterVec = useDerivedValue(() => vec(gradientCenter.value.x, gradientCenter.value.y));

  // Pre-compute particle positions to avoid calling hooks in render loop
  const particles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const radius = 80 + Math.sin(angle) * 20;
    
    return {
      angle,
      radius,
      x: useDerivedValue(() => gradientCenterX.value + Math.cos(angle) * radius),
      y: useDerivedValue(() => gradientCenterY.value + Math.sin(angle) * radius),
    };
  });

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      <Group>        {/* Subtle background gradient that follows active tab */}        <RoundedRect
          x={0}
          y={0}
          width={screenWidth}
          height={screenHeight}
          r={0}
          opacity={backgroundOpacity}
        >          <RadialGradient
            c={gradientCenterVec}
            r={screenWidth * 0.8}
            colors={[
              currentThemeColor + '20',
              currentThemeColor + '10',
              currentThemeColor + '05',
              'transparent',
            ]}
          />
        </RoundedRect>{/* Ambient glow effect */}
        <Circle
          cx={gradientCenterX}
          cy={gradientCenterY}
          r={120}
          opacity={glowOpacity}
        >
          <RadialGradient
            c={vec(0, 0)}
            r={120}
            colors={[
              currentThemeColor + '30',
              currentThemeColor + '15',
              currentThemeColor + '08',
              'transparent',
            ]}
          />
        </Circle>        {/* Subtle particles effect */}
        {particles.map((particle, i) => (
          <Circle
            key={i}
            cx={particle.x}
            cy={particle.y}
            r={2}
            opacity={glowOpacity}
            color={currentThemeColor + '60'}
          />
        ))}
      </Group>
    </Canvas>
  );
}
