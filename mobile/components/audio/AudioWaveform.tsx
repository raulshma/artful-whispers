import React, { useEffect, useState } from 'react';
import {
  View,
  Text as RNText,
  Animated,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface AudioWaveformProps {
  isRecording?: boolean;
  audioData?: number[];
  width?: number;
  height?: number;
  color?: string;
  barCount?: number;
  style?: ViewStyle;
}

export function AudioWaveform({
  isRecording = false,
  audioData = [],
  width = Dimensions.get('window').width - 40,
  height = 80,
  color,
  barCount = 20,
  style,
}: AudioWaveformProps) {
  const { theme } = useTheme();
  const [animatedValues] = useState(() =>
    Array.from({ length: barCount }, () => new Animated.Value(0.1))
  );

  const waveformColor = color || theme.colors.primary;
  const barWidth = (width - (barCount - 1) * 2) / barCount;

  useEffect(() => {
    if (isRecording) {
      // Simulate live audio visualization with random values
      const animateWaveform = () => {
        const animations = animatedValues.map((animatedValue) => {
          return Animated.timing(animatedValue, {
            toValue: Math.random() * 0.8 + 0.2,
            duration: 150 + Math.random() * 100,
            useNativeDriver: false,
          });
        });

        Animated.parallel(animations).start(() => {
          if (isRecording) {
            setTimeout(animateWaveform, 100);
          }
        });
      };

      animateWaveform();
    } else {
      // Reset to base state when not recording
      const resetAnimations = animatedValues.map((animatedValue) => {
        return Animated.timing(animatedValue, {
          toValue: 0.1,
          duration: 300,
          useNativeDriver: false,
        });
      });

      Animated.parallel(resetAnimations).start();
    }
  }, [isRecording, animatedValues]);

  useEffect(() => {
    if (audioData.length > 0) {
      // Use actual audio data if provided
      const normalizedData = audioData.slice(0, barCount);
      const animations = animatedValues.map((animatedValue, index) => {
        const value = normalizedData[index] || 0.1;
        return Animated.timing(animatedValue, {
          toValue: Math.max(0.1, Math.min(1, value)),
          duration: 200,
          useNativeDriver: false,
        });
      });

      Animated.parallel(animations).start();
    }
  }, [audioData, animatedValues, barCount]);

  return (
    <View style={[styles.container, { width, height }, style]}>
      <View style={styles.waveformContainer}>
        {animatedValues.map((animatedValue, index) => (
          <Animated.View
            key={index}
            style={[
              styles.bar,
              {
                width: barWidth,
                backgroundColor: waveformColor,
                height: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [height * 0.1, height * 0.9],
                }),
                opacity: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
  },
  bar: {
    borderRadius: 2,
    marginHorizontal: 1,
  },
});

// Recording indicator component
interface RecordingIndicatorProps {
  isRecording: boolean;
  duration?: number;
  style?: ViewStyle;
}

export function RecordingIndicator({
  isRecording,
  duration = 0,
  style,
}: RecordingIndicatorProps) {
  const { theme } = useTheme();
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (isRecording) {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isRecording) {
            pulse();
          }
        });
      };
      pulse();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[recordingStyles.container, style]}>
      <Animated.View
        style={[
          recordingStyles.indicator,
          {
            backgroundColor: theme.colors.semantic.error,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
      <View style={recordingStyles.textContainer}>
        <RNText style={[
          theme.typography.label,
          { color: theme.colors.text, marginLeft: theme.spacing.sm }
        ]}>
          {isRecording ? 'Recording' : 'Ready'}
        </RNText>
        {duration > 0 && (
          <RNText style={[
            theme.typography.captionSmall,
            { color: theme.colors.textSecondary, marginLeft: theme.spacing.sm }
          ]}>
            {formatDuration(duration)}
          </RNText>
        )}
      </View>
    </View>
  );
}

const recordingStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});