import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  Path,
  Skia,
  LinearGradient,
  vec,
  Blur,
} from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
  Easing,
  useDerivedValue,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

interface SkiaLoadingAnimationProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
  variant?: 'ripple' | 'morphing' | 'orbital' | 'breathing';
  visible?: boolean;
}

export function SkiaLoadingAnimation({
  size = 80,
  color,
  style,
  variant = 'ripple',
  visible = true,
}: SkiaLoadingAnimationProps) {
  const { theme } = useTheme();
  const animationColor = color || theme.colors.primary;

  if (variant === 'ripple') {
    return <RippleAnimation size={size} color={animationColor} style={style} visible={visible} />;
  }

  if (variant === 'morphing') {
    return <MorphingAnimation size={size} color={animationColor} style={style} visible={visible} />;
  }

  if (variant === 'orbital') {
    return <OrbitalAnimation size={size} color={animationColor} style={style} visible={visible} />;
  }

  if (variant === 'breathing') {
    return <BreathingAnimation size={size} color={animationColor} style={style} visible={visible} />;
  }

  return <RippleAnimation size={size} color={animationColor} style={style} visible={visible} />;
}

// Ripple Animation - Expanding concentric circles
function RippleAnimation({ 
  size, 
  color, 
  style, 
  visible 
}: { 
  size: number; 
  color: string; 
  style?: ViewStyle; 
  visible: boolean;
}) {
  const center = size / 2;
  const maxRadius = size * 0.4;
  
  const ripple1 = useSharedValue(0);
  const ripple2 = useSharedValue(0);
  const ripple3 = useSharedValue(0);
  const opacity = useSharedValue(visible ? 1 : 0);
  const scale = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    const duration = 2000;
    const delay = 600;

    // Visibility animation
    opacity.value = withTiming(visible ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });

    scale.value = withTiming(visible ? 1 : 0, {
      duration: 400,
      easing: Easing.elastic(1.2),
    });

    if (visible) {
      // Ripple animations with staggered delays
      ripple1.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(1, { duration, easing: Easing.out(Easing.quad) })
        ),
        -1,
        false
      );

      setTimeout(() => {
        ripple2.value = withRepeat(
          withSequence(
            withTiming(0, { duration: 0 }),
            withTiming(1, { duration, easing: Easing.out(Easing.quad) })
          ),
          -1,
          false
        );
      }, delay);

      setTimeout(() => {
        ripple3.value = withRepeat(
          withSequence(
            withTiming(0, { duration: 0 }),
            withTiming(1, { duration, easing: Easing.out(Easing.quad) })
          ),
          -1,
          false
        );
      }, delay * 2);
    } else {
      ripple1.value = 0;
      ripple2.value = 0;
      ripple3.value = 0;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const ripple1Style = useAnimatedStyle(() => ({
    transform: [{ scale: ripple1.value }],
    opacity: 1 - ripple1.value,
  }));

  const ripple2Style = useAnimatedStyle(() => ({
    transform: [{ scale: ripple2.value }],
    opacity: 1 - ripple2.value,
  }));

  const ripple3Style = useAnimatedStyle(() => ({
    transform: [{ scale: ripple3.value }],
    opacity: 1 - ripple3.value,
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, style, animatedStyle]}>
      {/* Ripple 1 */}
      <Animated.View 
        style={[
          {
            position: 'absolute',
            width: maxRadius * 2,
            height: maxRadius * 2,
            left: center - maxRadius,
            top: center - maxRadius,
            borderRadius: maxRadius,
            borderWidth: 3,
            borderColor: color,
          },
          ripple1Style
        ]}
      />
      
      {/* Ripple 2 */}
      <Animated.View 
        style={[
          {
            position: 'absolute',
            width: maxRadius * 2,
            height: maxRadius * 2,
            left: center - maxRadius,
            top: center - maxRadius,
            borderRadius: maxRadius,
            borderWidth: 2,
            borderColor: color,
          },
          ripple2Style
        ]}
      />
      
      {/* Ripple 3 */}
      <Animated.View 
        style={[
          {
            position: 'absolute',
            width: maxRadius * 2,
            height: maxRadius * 2,
            left: center - maxRadius,
            top: center - maxRadius,
            borderRadius: maxRadius,
            borderWidth: 1,
            borderColor: color,
          },
          ripple3Style
        ]}
      />
      
      {/* Center dot */}
      <Animated.View 
        style={{
          position: 'absolute',
          width: 8,
          height: 8,
          left: center - 4,
          top: center - 4,
          borderRadius: 4,
          backgroundColor: color,
        }}
      />
    </Animated.View>
  );
}

// Morphing Animation - Shape-shifting blob using Skia
function MorphingAnimation({ 
  size, 
  color, 
  style, 
  visible 
}: { 
  size: number; 
  color: string; 
  style?: ViewStyle; 
  visible: boolean;
}) {
  const center = size / 2;
  const baseRadius = size * 0.15;
  
  const morph = useSharedValue(0);
  const opacity = useSharedValue(visible ? 1 : 0);
  const scale = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });

    scale.value = withTiming(visible ? 1 : 0, {
      duration: 400,
      easing: Easing.elastic(1.2),
    });

    if (visible) {
      morph.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const createMorphPath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    const t = morph.value;
    
    const radius1 = baseRadius * (1 + 0.5 * Math.sin(t * Math.PI * 2));
    const radius2 = baseRadius * (1 + 0.5 * Math.cos(t * Math.PI * 2 + Math.PI / 3));
    const radius3 = baseRadius * (1 + 0.5 * Math.sin(t * Math.PI * 2 + Math.PI * 2 / 3));
    const radius4 = baseRadius * (1 + 0.5 * Math.cos(t * Math.PI * 2 + Math.PI));

    path.moveTo(center + radius1, center);
    path.quadTo(center, center - radius2, center - radius3, center);
    path.quadTo(center, center + radius4, center + radius1, center);
    path.close();

    return path;
  });

  return (
    <Animated.View style={[{ width: size, height: size }, style, animatedStyle]}>
      <Canvas style={{ width: size, height: size }}>
        <Path
          path={createMorphPath}
          color={color}
          opacity={0.7}
        >
          <LinearGradient
            start={vec(0, 0)}
            end={vec(size, size)}
            colors={[color, color + '40']}
          />
          <Blur blur={2} />
        </Path>
      </Canvas>
    </Animated.View>
  );
}

// Orbital Animation - Particles orbiting around center
function OrbitalAnimation({ 
  size, 
  color, 
  style, 
  visible 
}: { 
  size: number; 
  color: string; 
  style?: ViewStyle; 
  visible: boolean;
}) {
  const center = size / 2;
  const orbitRadius = size * 0.25;
  
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(visible ? 1 : 0);
  const scale = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });

    scale.value = withTiming(visible ? 1 : 0, {
      duration: 400,
      easing: Easing.elastic(1.2),
    });

    if (visible) {
      rotation.value = withRepeat(
        withTiming(2 * Math.PI, {
          duration: 3000,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const particles = Array.from({ length: 6 }, (_, i) => i);

  return (
    <Animated.View style={[{ width: size, height: size }, style, animatedStyle]}>
      <Canvas style={{ width: size, height: size }}>
        {/* Orbit path */}
        <Circle
          cx={center}
          cy={center}
          r={orbitRadius}
          color={color}
          opacity={0.2}
          style="stroke"
          strokeWidth={1}
        />
        
        {/* Orbiting particles */}
        {particles.map((_, index) => {
          const angle = useDerivedValue(() => 
            rotation.value + (index * 2 * Math.PI) / particles.length
          );
          const x = useDerivedValue(() => center + Math.cos(angle.value) * orbitRadius);
          const y = useDerivedValue(() => center + Math.sin(angle.value) * orbitRadius);
          const particleSize = useDerivedValue(() => 
            4 + Math.sin(rotation.value + index) * 2
          );
          const particleOpacity = useDerivedValue(() => 
            0.8 + Math.sin(rotation.value + index) * 0.2
          );
          
          return (
            <Circle
              key={index}
              cx={x}
              cy={y}
              r={particleSize}
              color={color}
              opacity={particleOpacity}
            />
          );
        })}
        
        {/* Center core */}
        <Circle
          cx={center}
          cy={center}
          r={6}
          color={color}
          opacity={0.5}
        />
      </Canvas>
    </Animated.View>
  );
}

// Breathing Animation - Pulsing organic shape
function BreathingAnimation({ 
  size, 
  color, 
  style, 
  visible 
}: { 
  size: number; 
  color: string; 
  style?: ViewStyle; 
  visible: boolean;
}) {
  const center = size / 2;
  
  const breathe = useSharedValue(0);
  const opacity = useSharedValue(visible ? 1 : 0);
  const scale = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });

    scale.value = withTiming(visible ? 1 : 0, {
      duration: 400,
      easing: Easing.elastic(1.2),
    });

    if (visible) {
      breathe.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        false
      );
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const innerRadius = useDerivedValue(() => 
    size * 0.1 * (1 + breathe.value * 0.5)
  );
  const middleRadius = useDerivedValue(() => 
    size * 0.2 * (1 + breathe.value * 0.3)
  );
  const outerRadius = useDerivedValue(() => 
    size * 0.3 * (1 + breathe.value * 0.1)
  );

  return (
    <Animated.View style={[{ width: size, height: size }, style, animatedStyle]}>
      <Canvas style={{ width: size, height: size }}>
        {/* Outer ring */}
        <Circle
          cx={center}
          cy={center}
          r={outerRadius}
          color={color}
          opacity={useDerivedValue(() => 0.2 * (1 - breathe.value * 0.5))}
        />
        
        {/* Middle ring */}
        <Circle
          cx={center}
          cy={center}
          r={middleRadius}
          color={color}
          opacity={useDerivedValue(() => 0.4 * (1 - breathe.value * 0.3))}
        />
        
        {/* Inner core */}
        <Circle
          cx={center}
          cy={center}
          r={innerRadius}
          color={color}
          opacity={0.8}
        >
          <LinearGradient
            start={vec(0, 0)}
            end={vec(size, size)}
            colors={[color, color + '80']}
          />
        </Circle>
      </Canvas>
    </Animated.View>
  );
}

export default SkiaLoadingAnimation;