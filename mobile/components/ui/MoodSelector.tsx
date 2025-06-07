import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme, useColors } from '@/contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

interface MoodOption {
  id: string;
  label: string;
  color: string;
  emoji: string;
  value: number; // 0-100 scale
}

const DEFAULT_MOODS: MoodOption[] = [
  { id: 'sad', label: 'Sad', color: '#74B9FF', emoji: '😢', value: 10 },
  { id: 'anxious', label: 'Anxious', color: '#FD79A8', emoji: '😰', value: 25 },
  { id: 'neutral', label: 'Neutral', color: '#95A5A6', emoji: '😐', value: 50 },
  { id: 'calm', label: 'Calm', color: '#4ECDC4', emoji: '😌', value: 65 },
  { id: 'happy', label: 'Happy', color: '#FFD93D', emoji: '😊', value: 80 },
  { id: 'excited', label: 'Excited', color: '#FF6B6B', emoji: '🤗', value: 95 },
];

interface MoodSelectorProps {
  moods?: MoodOption[];
  onMoodChange: (mood: MoodOption) => void;
  initialMood?: MoodOption;
  sliderWidth?: number;
}

export function MoodSelector({
  moods = DEFAULT_MOODS,
  onMoodChange,
  initialMood,
  sliderWidth = 300,
}: MoodSelectorProps) {
  const { theme } = useTheme();
  const colors = useColors();
  
  const [selectedMood, setSelectedMood] = useState<MoodOption>(
    initialMood || moods[Math.floor(moods.length / 2)]
  );

  const translateX = useSharedValue(
    initialMood ? (initialMood.value / 100) * sliderWidth : sliderWidth / 2
  );

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const updateMood = (value: number) => {
    const normalizedValue = Math.max(0, Math.min(100, value));
    const closestMood = moods.reduce((prev, current) => {
      return Math.abs(current.value - normalizedValue) < Math.abs(prev.value - normalizedValue)
        ? current
        : prev;
    });

    if (closestMood.id !== selectedMood.id) {
      setSelectedMood(closestMood);
      onMoodChange(closestMood);
      triggerHaptic();
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      const newX = context.startX + event.translationX;
      const clampedX = Math.max(0, Math.min(sliderWidth, newX));
      translateX.value = clampedX;
      
      const percentage = (clampedX / sliderWidth) * 100;
      runOnJS(updateMood)(percentage);
    },
    onEnd: () => {
      const targetValue = (selectedMood.value / 100) * sliderWidth;
      translateX.value = withSpring(targetValue);
    },
  });

  const thumbStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateX.value,
      [0, sliderWidth / 2, sliderWidth],
      [0.8, 1.2, 0.8]
    );

    return {
      transform: [
        { translateX: translateX.value - 25 }, // Half of thumb width
        { scale },
      ],
    };
  });

  const trackFillStyle = useAnimatedStyle(() => {
    return {
      width: translateX.value,
    };
  });

  return (
    <View style={[styles.container, { width: sliderWidth + 50 }]}>
      {/* Mood Display */}
      <View style={styles.moodDisplay}>
        <Text style={[styles.moodEmoji, { fontSize: 80 }]}>
          {selectedMood.emoji}
        </Text>
        <Text style={[
          theme.typography.h3,
          { color: theme.colors.text, marginTop: theme.spacing.sm }
        ]}>
          {selectedMood.label}
        </Text>
      </View>

      {/* Slider */}
      <View style={styles.sliderContainer}>
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={[styles.slider, { width: sliderWidth }]}>
            {/* Track Background */}
            <View style={[
              styles.track,
              { backgroundColor: theme.colors.backgroundTertiary }
            ]} />
            
            {/* Track Fill */}
            <Animated.View style={[
              styles.trackFill,
              { backgroundColor: selectedMood.color },
              trackFillStyle,
            ]} />
            
            {/* Thumb */}
            <Animated.View style={[
              styles.thumb,
              { backgroundColor: selectedMood.color },
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

      {/* Mood Labels */}
      <View style={[styles.labelsContainer, { width: sliderWidth }]}>
        {moods.map((mood, index) => (
          <View
            key={mood.id}
            style={[
              styles.labelContainer,
              { left: (mood.value / 100) * sliderWidth - 20 }
            ]}
          >
            <Text style={[
              theme.typography.captionSmall,
              {
                color: selectedMood.id === mood.id 
                  ? theme.colors.text 
                  : theme.colors.textTertiary,
                fontWeight: selectedMood.id === mood.id ? 'bold' : 'normal',
              }
            ]}>
              {mood.emoji}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  moodDisplay: {
    alignItems: 'center',
    marginBottom: 40,
  },
  moodEmoji: {
    textAlign: 'center',
  },
  sliderContainer: {
    marginBottom: 20,
  },
  slider: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    width: '100%',
  },
  trackFill: {
    height: 6,
    borderRadius: 3,
    position: 'absolute',
  },
  thumb: {
    width: 50,
    height: 50,
    borderRadius: 25,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  thumbInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  labelsContainer: {
    height: 30,
    position: 'relative',
  },
  labelContainer: {
    position: 'absolute',
    width: 40,
    alignItems: 'center',
  },
});

export { DEFAULT_MOODS };
export type { MoodOption };