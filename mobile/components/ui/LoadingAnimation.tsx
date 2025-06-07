import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

interface LoadingAnimationProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
  variant?: 'spinner' | 'dots' | 'pulse' | 'wave' | 'skia-ripple' | 'skia-morphing' | 'skia-orbital' | 'skia-breathing';
  visible?: boolean;
}

export function LoadingAnimation({
  size = 40,
  color,
  style,
  variant = 'spinner',
  visible = true,
}: LoadingAnimationProps) {
  const { theme } = useTheme();
  const animationColor = color || theme.colors.primary;

  // Skia variants
  if (variant === 'skia-ripple') {
    const { SkiaLoadingAnimation } = require('./SkiaLoadingAnimation');
    return <SkiaLoadingAnimation size={size} color={animationColor} style={style} variant="ripple" visible={visible} />;
  }

  if (variant === 'skia-morphing') {
    const { SkiaLoadingAnimation } = require('./SkiaLoadingAnimation');
    return <SkiaLoadingAnimation size={size} color={animationColor} style={style} variant="morphing" visible={visible} />;
  }

  if (variant === 'skia-orbital') {
    const { SkiaLoadingAnimation } = require('./SkiaLoadingAnimation');
    return <SkiaLoadingAnimation size={size} color={animationColor} style={style} variant="orbital" visible={visible} />;
  }

  if (variant === 'skia-breathing') {
    const { SkiaLoadingAnimation } = require('./SkiaLoadingAnimation');
    return <SkiaLoadingAnimation size={size} color={animationColor} style={style} variant="breathing" visible={visible} />;
  }

  // Standard variants
  if (variant === 'spinner') {
    return <SpinnerAnimation size={size} color={animationColor} style={style} visible={visible} />;
  }

  if (variant === 'dots') {
    return <DotsAnimation size={size} color={animationColor} style={style} />;
  }

  if (variant === 'pulse') {
    return <PulseAnimation size={size} color={animationColor} style={style} />;
  }

  if (variant === 'wave') {
    return <WaveAnimation size={size} color={animationColor} style={style} />;
  }

  return <SpinnerAnimation size={size} color={animationColor} style={style} visible={visible} />;
}

// Spinner Animation
function SpinnerAnimation({ size, color, style, visible = true }: { size: number; color: string; style?: ViewStyle; visible?: boolean }) {
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(visible ? 1 : 0);
  const scale = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 300 });
    scale.value = withTiming(visible ? 1 : 0, { duration: 400 });

    if (visible) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000 }),
        -1,
        false
      );
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value }
      ],
    };
  });

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 3,
            borderColor: 'transparent',
            borderTopColor: color,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

// Dots Animation
function DotsAnimation({ size, color, style }: { size: number; color: string; style?: ViewStyle }) {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    const duration = 600;
    const delay = 200;

    dot1.value = withRepeat(
      withSequence(
        withTiming(1, { duration }),
        withTiming(0.3, { duration })
      ),
      -1,
      false
    );

    setTimeout(() => {
      dot2.value = withRepeat(
        withSequence(
          withTiming(1, { duration }),
          withTiming(0.3, { duration })
        ),
        -1,
        false
      );
    }, delay);

    setTimeout(() => {
      dot3.value = withRepeat(
        withSequence(
          withTiming(1, { duration }),
          withTiming(0.3, { duration })
        ),
        -1,
        false
      );
    }, delay * 2);
  }, []);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1.value,
    transform: [{ scale: dot1.value }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2.value,
    transform: [{ scale: dot2.value }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3.value,
    transform: [{ scale: dot3.value }],
  }));

  const dotSize = size / 4;

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }, style]}>
      <Animated.View
        style={[
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
            marginHorizontal: 2,
          },
          dot1Style,
        ]}
      />
      <Animated.View
        style={[
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
            marginHorizontal: 2,
          },
          dot2Style,
        ]}
      />
      <Animated.View
        style={[
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
            marginHorizontal: 2,
          },
          dot3Style,
        ]}
      />
    </View>
  );
}

// Pulse Animation
function PulseAnimation({ size, color, style }: { size: number; color: string; style?: ViewStyle }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

// Wave Animation
function WaveAnimation({ size, color, style }: { size: number; color: string; style?: ViewStyle }) {
  const wave1 = useSharedValue(0);
  const wave2 = useSharedValue(0);
  const wave3 = useSharedValue(0);

  useEffect(() => {
    const duration = 1500;

    wave1.value = withRepeat(
      withTiming(1, { duration }),
      -1,
      false
    );

    setTimeout(() => {
      wave2.value = withRepeat(
        withTiming(1, { duration }),
        -1,
        false
      );
    }, 200);

    setTimeout(() => {
      wave3.value = withRepeat(
        withTiming(1, { duration }),
        -1,
        false
      );
    }, 400);
  }, []);

  const wave1Style = useAnimatedStyle(() => {
    const height = interpolate(wave1.value, [0, 0.5, 1], [size * 0.2, size, size * 0.2]);
    return { height };
  });

  const wave2Style = useAnimatedStyle(() => {
    const height = interpolate(wave2.value, [0, 0.5, 1], [size * 0.2, size, size * 0.2]);
    return { height };
  });

  const wave3Style = useAnimatedStyle(() => {
    const height = interpolate(wave3.value, [0, 0.5, 1], [size * 0.2, size, size * 0.2]);
    return { height };
  });

  const barWidth = size / 6;

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: size }, style]}>
      <Animated.View
        style={[
          {
            width: barWidth,
            backgroundColor: color,
            borderRadius: barWidth / 2,
            marginHorizontal: 1,
          },
          wave1Style,
        ]}
      />
      <Animated.View
        style={[
          {
            width: barWidth,
            backgroundColor: color,
            borderRadius: barWidth / 2,
            marginHorizontal: 1,
          },
          wave2Style,
        ]}
      />
      <Animated.View
        style={[
          {
            width: barWidth,
            backgroundColor: color,
            borderRadius: barWidth / 2,
            marginHorizontal: 1,
          },
          wave3Style,
        ]}
      />
    </View>
  );
}

// Transcribing animation specifically for audio transcription
export function TranscribingAnimation({ style }: { style?: ViewStyle }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.transcribingContainer, style]}>
      <LoadingAnimation variant="wave" size={40} color={theme.colors.primary} />
      <View style={{ marginTop: theme.spacing.md }}>
        <DotsAnimation size={24} color={theme.colors.textSecondary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  transcribingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
});