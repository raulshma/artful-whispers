import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

type MoodLevel = 'overjoyed' | 'happy' | 'neutral' | 'sad' | 'depressed';

interface MoodOption {
  id: MoodLevel;
  label: string;
  icon: string;
  color: string;
}

interface CheckInQuestion {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'scale' | 'text';
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: string[];
}

interface MoodCheckInProps {
  onComplete: (responses: Record<string, any>) => void;
  onClose: () => void;
}

export default function MoodCheckIn({ onComplete, onClose }: MoodCheckInProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});

  const moodOptions: MoodOption[] = [
    {
      id: 'overjoyed',
      label: "I'm Feeling Overjoyed",
      icon: 'happy',
      color: theme.colors.mood.happy,
    },
    {
      id: 'happy',
      label: "I'm Feeling Happy",
      icon: 'happy-outline',
      color: theme.colors.mood.happy,
    },
    {
      id: 'neutral',
      label: "I'm Feeling Neutral",
      icon: 'remove',
      color: theme.colors.mood.neutral,
    },
    {
      id: 'sad',
      label: "I'm Feeling Sad",
      icon: 'sad-outline',
      color: theme.colors.mood.sad,
    },
    {
      id: 'depressed',
      label: "I'm Feeling Depressed",
      icon: 'sad',
      color: theme.colors.mood.negative,
    },
  ];

  const questions: CheckInQuestion[] = [
    {
      id: 'causes',
      text: 'Why do you feel depressed?',
      type: 'multiple',
      options: ['Work', 'Family', 'Friend', 'Social Media', 'Financial Issue', 'Health', 'Other'],
    },
    {
      id: 'activity_level',
      text: 'How active are you? (1 - 10)',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 10,
    },
    {
      id: 'sleep_hours',
      text: 'How long did you sleep last night?',
      type: 'scale',
      scaleMin: 1,
      scaleMax: 12,
      scaleLabels: ['Hour'],
    },
    {
      id: 'social_interaction',
      text: 'Did you interact/socialize with other people today?',
      type: 'single',
      options: ['None', '1', '2', '3', '4', '5+'],
    },
    {
      id: 'company',
      text: 'Who are you currently with?',
      type: 'single',
      options: ['Alone', 'Friend', 'Family', 'Pet', 'Colleague', 'Partner', 'AI', 'Other'],
    },
    {
      id: 'notes',
      text: 'Enter additional note',
      type: 'text',
    },
  ];

  const handleMoodSelect = (mood: MoodLevel) => {
    setSelectedMood(mood);
    setResponses({ ...responses, mood });
    // Skip questions if mood is positive
    if (mood === 'overjoyed' || mood === 'happy') {
      setCurrentStep(questions.length); // Go to completion
    } else {
      setCurrentStep(1); // Go to first question
    }
  };

  const handleResponse = (questionId: string, response: any) => {
    const newResponses = { ...responses, [questionId]: response };
    setResponses(newResponses);
    
    if (currentStep < questions.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(newResponses);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      setSelectedMood(null);
    }
  };

  const renderMoodSelection = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>How are you feeling this day?</Text>
        
        <View style={styles.moodContainer}>
          <View style={styles.moodFace}>
            <Ionicons 
              name="happy" 
              size={80} 
              color={theme.colors.primary} 
            />
          </View>
          
          <View style={styles.moodOptions}>
            {moodOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.moodOption,
                  selectedMood === option.id && styles.selectedMoodOption
                ]}
                onPress={() => handleMoodSelect(option.id)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={option.icon as any} 
                  size={24} 
                  color={option.color} 
                />
                <Text style={styles.moodOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.continueButton,
            selectedMood && { backgroundColor: theme.colors.primary }
          ]}
          disabled={!selectedMood}
          onPress={() => selectedMood && handleMoodSelect(selectedMood)}
        >
          <Text style={[
            styles.continueButtonText,
            selectedMood && { color: '#FFFFFF' }
          ]}>
            Set Mood ✓
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderQuestion = () => {
    const question = questions[currentStep - 1];
    if (!question) return null;

    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.closeButton}>
            <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.moodIndicator}>
            <Ionicons 
              name="sad" 
              size={48} 
              color={theme.colors.mood.negative} 
            />
          </View>
          
          <Text style={styles.questionTitle}>{question.text}</Text>
          
          {question.type === 'single' && (
            <Text style={styles.questionSubtitle}>Select the causes</Text>
          )}

          <View style={styles.optionsContainer}>
            {question.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionButton}
                onPress={() => handleResponse(question.id, option)}
                activeOpacity={0.7}
              >
                <Text style={styles.optionButtonText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => handleResponse(question.id, 'skipped')}
          >
            <Text style={styles.continueButtonText}>Continue →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  if (currentStep === 0) {
    return renderMoodSelection();
  } else if (currentStep <= questions.length) {
    return renderQuestion();
  } else {
    // Completion screen
    return (
      <View style={styles.completionContainer}>
        <View style={styles.completionContent}>
          <Ionicons 
            name="checkmark-circle" 
            size={64} 
            color={theme.colors.primary} 
          />
          <Text style={styles.completionTitle}>Check In Completed</Text>
          <Text style={styles.completionSubtitle}>
            Thank you for checking in your mood today. Don&apos;t forget to check in daily.
          </Text>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => onComplete(responses)}
          >
            <Text style={styles.continueButtonText}>Continue →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  moodContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  moodFace: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.backgroundGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  moodOptions: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  moodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.md,
  },
  selectedMoodOption: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  moodOptionText: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
  },
  continueButton: {
    backgroundColor: theme.colors.backgroundSecondary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.xl,
    minWidth: 200,
    alignItems: 'center',
  },
  continueButtonText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  moodIndicator: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  questionTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  questionSubtitle: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  optionsContainer: {
    width: '100%',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  optionButton: {
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  optionButtonText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  completionContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionContent: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  completionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  completionSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
});
