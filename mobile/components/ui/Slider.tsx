import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onValueChange: (value: number) => void;
  label?: string;
  showValue?: boolean;
  width?: number;
  trackColor?: string;
  thumbColor?: string;
  activeTrackColor?: string;
  disabled?: boolean;
  style?: ViewStyle;
  formatValue?: (value: number) => string;
}

export function Slider({
  min = 0,
  max = 100,
  step = 1,
  value = 0,
  onValueChange,
  label,
  showValue = true,
  width = 280,
  trackColor,
  thumbColor,
  activeTrackColor,
  disabled = false,
  style,
  formatValue,
}: SliderProps) {
  const { theme } = useTheme();
  const [currentValue, setCurrentValue] = useState(value);

  const translateX = useSharedValue(
    ((value - min) / (max - min)) * width
  );

  const triggerHaptic = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const updateValue = (newValue: number) => {
    if (disabled) return;
    
    const clampedValue = Math.max(min, Math.min(max, newValue));
    const steppedValue = Math.round(clampedValue / step) * step;
    
    if (steppedValue !== currentValue) {
      setCurrentValue(steppedValue);
      onValueChange(steppedValue);
      triggerHaptic();
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      if (disabled) return;
      
      const newX = context.startX + event.translationX;
      const clampedX = Math.max(0, Math.min(width, newX));
      translateX.value = clampedX;
      
      const percentage = clampedX / width;
      const newValue = min + percentage * (max - min);
      runOnJS(updateValue)(newValue);
    },
    onEnd: () => {
      if (disabled) return;
      
      const targetValue = ((currentValue - min) / (max - min)) * width;
      translateX.value = withSpring(targetValue);
    },
  });

  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value - 12 }], // Half of thumb width
    };
  });

  const trackFillStyle = useAnimatedStyle(() => {
    return {
      width: translateX.value,
    };
  });

  const getTrackColor = () => trackColor || theme.colors.backgroundTertiary;
  const getActiveTrackColor = () => activeTrackColor || theme.colors.primary;
  const getThumbColor = () => thumbColor || theme.colors.primary;

  const displayValue = formatValue ? formatValue(currentValue) : currentValue.toString();

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[
            theme.typography.label,
            { color: theme.colors.textSecondary }
          ]}>
            {label}
          </Text>
          {showValue && (
            <Text style={[
              theme.typography.label,
              { color: theme.colors.text }
            ]}>
              {displayValue}
            </Text>
          )}
        </View>
      )}
      
      <View style={[styles.sliderContainer, { width: width + 24 }]}>
        <PanGestureHandler onGestureEvent={gestureHandler} enabled={!disabled}>
          <Animated.View style={[styles.slider, { width }]}>
            {/* Track Background */}
            <View style={[
              styles.track,
              { backgroundColor: getTrackColor() }
            ]} />
            
            {/* Track Fill */}
            <Animated.View style={[
              styles.trackFill,
              { backgroundColor: getActiveTrackColor() },
              trackFillStyle,
            ]} />
            
            {/* Thumb */}
            <Animated.View style={[
              styles.thumb,
              {
                backgroundColor: getThumbColor(),
                opacity: disabled ? 0.5 : 1,
              },
              thumbStyle,
            ]}>
              <View style={[
                styles.thumbInner,
                { backgroundColor: theme.colors.surface }
              ]} />
            </Animated.View>
          </Animated.View>
        </PanGestureHandler>
      </View>
      
      {/* Min/Max Labels */}
      <View style={[styles.labelsContainer, { width }]}>
        <Text style={[
          theme.typography.captionSmall,
          { color: theme.colors.textTertiary }
        ]}>
          {formatValue ? formatValue(min) : min}
        </Text>
        <Text style={[
          theme.typography.captionSmall,
          { color: theme.colors.textTertiary }
        ]}>
          {formatValue ? formatValue(max) : max}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sliderContainer: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  slider: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    width: '100%',
  },
  trackFill: {
    height: 4,
    borderRadius: 2,
    position: 'absolute',
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
});