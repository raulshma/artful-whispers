import React from 'react';
import { View } from 'react-native';
import {
  Canvas,
  Circle,
  Path,
  Group,
  Skia,
} from '@shopify/react-native-skia';
import { useTheme } from '@/contexts/ThemeContext';

interface MoodIconProps {
  mood: string;
  size?: number;
  color?: string;
  animated?: boolean;
}

export function MoodIcon({
  mood,
  size = 48,
  color,
  animated = false,
}: MoodIconProps) {
  const { theme } = useTheme();
  const [animationState, setAnimationState] = React.useState(0);
  
  React.useEffect(() => {
    if (animated) {
      const interval = setInterval(() => {
        setAnimationState(prev => (prev + 0.1) % (Math.PI * 2));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [animated]);

  const moodColor = color || getMoodColor(mood, theme);
  const center = size / 2;
  const radius = size * 0.4;

  const animatedRadius = animated
    ? radius + Math.sin(animationState) * radius * 0.05
    : radius;

  const getFacePath = (moodType: string) => {
    const eyeY = center - radius * 0.3;
    const eyeLeftX = center - radius * 0.3;
    const eyeRightX = center + radius * 0.3;
    const mouthY = center + radius * 0.2;
    
    const path = Skia.Path.Make();
    
    // Eyes
    path.addCircle(eyeLeftX, eyeY, radius * 0.1);
    path.addCircle(eyeRightX, eyeY, radius * 0.1);
    
    // Mouth based on mood
    switch (moodType.toLowerCase()) {
      case 'happy':
      case 'joy':
      case 'excited':
        // Smile
        path.moveTo(center - radius * 0.3, mouthY);
        path.quadTo(center, mouthY + radius * 0.3, center + radius * 0.3, mouthY);
        break;
        
      case 'sad':
      case 'down':
      case 'depressed':
        // Frown
        path.moveTo(center - radius * 0.3, mouthY + radius * 0.2);
        path.quadTo(center, mouthY - radius * 0.1, center + radius * 0.3, mouthY + radius * 0.2);
        break;
        
      case 'angry':
      case 'frustrated':
        // Angry mouth
        path.moveTo(center - radius * 0.2, mouthY);
        path.lineTo(center + radius * 0.2, mouthY);
        // Angry eyebrows
        path.moveTo(eyeLeftX - radius * 0.15, eyeY - radius * 0.2);
        path.lineTo(eyeLeftX + radius * 0.15, eyeY - radius * 0.1);
        path.moveTo(eyeRightX - radius * 0.15, eyeY - radius * 0.1);
        path.lineTo(eyeRightX + radius * 0.15, eyeY - radius * 0.2);
        break;
        
      case 'anxious':
      case 'worried':
        // Wavy mouth
        path.moveTo(center - radius * 0.3, mouthY);
        path.quadTo(center - radius * 0.1, mouthY - radius * 0.1, center, mouthY);
        path.quadTo(center + radius * 0.1, mouthY + radius * 0.1, center + radius * 0.3, mouthY);
        break;
        
      case 'neutral':
      case 'okay':
      default:
        // Straight line
        path.moveTo(center - radius * 0.2, mouthY);
        path.lineTo(center + radius * 0.2, mouthY);
        break;
    }
    
    return path;
  };

  return (
    <View style={{ width: size, height: size }}>
      <Canvas style={{ flex: 1 }}>
        <Group>
          {/* Face circle */}
          <Circle
            cx={center}
            cy={center}
            r={animatedRadius}
            color={moodColor}
            opacity={0.2}
          />
          <Circle
            cx={center}
            cy={center}
            r={animatedRadius}
            color={moodColor}
            style="stroke"
            strokeWidth={3}
          />
          
          {/* Facial features */}
          <Path
            path={getFacePath(mood)}
            color={moodColor}
            style="stroke"
            strokeWidth={2}
            strokeCap="round"
            strokeJoin="round"
          />
        </Group>
      </Canvas>
    </View>
  );
}

// Helper function to get mood color
function getMoodColor(mood: string, theme: any): string {
  const moodColors = {
    happy: theme.colors.mood.happy,
    joy: theme.colors.mood.happy,
    excited: theme.colors.mood.energetic,
    sad: theme.colors.mood.sad,
    down: theme.colors.mood.sad,
    depressed: theme.colors.mood.sad,
    angry: theme.colors.mood.angry,
    frustrated: theme.colors.mood.angry,
    anxious: theme.colors.mood.anxious,
    worried: theme.colors.mood.anxious,
    calm: theme.colors.mood.calm,
    peaceful: theme.colors.mood.calm,
    neutral: theme.colors.mood.neutral,
    okay: theme.colors.mood.neutral,
  };
  
  return moodColors[mood.toLowerCase() as keyof typeof moodColors] || theme.colors.mood.neutral;
}

// Preset mood icons for common emotions
export function HappyMoodIcon({ size, animated }: { size?: number; animated?: boolean }) {
  return <MoodIcon mood="happy" size={size} animated={animated} />;
}

export function SadMoodIcon({ size, animated }: { size?: number; animated?: boolean }) {
  return <MoodIcon mood="sad" size={size} animated={animated} />;
}

export function AngryMoodIcon({ size, animated }: { size?: number; animated?: boolean }) {
  return <MoodIcon mood="angry" size={size} animated={animated} />;
}

export function AnxiousMoodIcon({ size, animated }: { size?: number; animated?: boolean }) {
  return <MoodIcon mood="anxious" size={size} animated={animated} />;
}

export function NeutralMoodIcon({ size, animated }: { size?: number; animated?: boolean }) {
  return <MoodIcon mood="neutral" size={size} animated={animated} />;
}

// Grid of mood icons for selection
export function MoodIconGrid({
  moods,
  selectedMood,
  onMoodSelect,
  iconSize = 48,
}: {
  moods: string[];
  selectedMood?: string;
  onMoodSelect: (mood: string) => void;
  iconSize?: number;
}) {
  const { theme } = useTheme();

  return (
    <View style={{
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: theme.spacing.md,
    }}>
      {moods.map((mood) => (
        <View
          key={mood}
          style={{
            padding: theme.spacing.sm,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: selectedMood === mood 
              ? theme.colors.primary + '20' 
              : 'transparent',
          }}
        >
          <MoodIcon
            mood={mood}
            size={iconSize}
            animated={selectedMood === mood}
          />
        </View>
      ))}
    </View>
  );
}