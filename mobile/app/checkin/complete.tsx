import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Header,
  Button,
  Card,
  LoadingAnimation
} from '@/components/ui';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as Haptics from 'expo-haptics';

export default function CheckinComplete() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Simulate saving the check-in data
  useEffect(() => {
    // Provide haptic feedback for completion
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // In a real app, this would save the check-in data to the backend
    const checkInData = {
      mood: params.mood,
      moodLabel: params.moodLabel,
      causes: JSON.parse(params.causes as string || '[]'),
      activityLevel: parseInt(params.activityLevel as string || '5'),
      sleepDuration: parseInt(params.sleepDuration as string || '8'),
      socialInteraction: params.socialInteraction,
      additionalNotes: params.additionalNotes,
      companions: JSON.parse(params.companions as string || '[]'),
      location: params.location,
      timestamp: new Date().toISOString(),
    };

    console.log('Check-in completed:', checkInData);
  }, [params]);

  const handleContinue = () => {
    // Navigate back to the main app
    router.replace('/(tabs)');
  };

  const handleViewInsights = () => {
    // Navigate to insights/stats page
    router.replace('/(tabs)');
    // Could also navigate to a specific insights page
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title="Check In Complete"
        rightComponent={
          <Button
            title="Done"
            variant="ghost"
            onPress={handleContinue}
          />
        }
      />

      <View style={styles.content}>
        <Card style={styles.successCard}>
          <View style={styles.successIcon}>
            <View style={[styles.iconCircle, { backgroundColor: theme.colors.semantic.success + '20' }]}>
              <IconSymbol 
                name="checkmark.circle.fill" 
                size={64} 
                color={theme.colors.semantic.success} 
              />
            </View>
          </View>

          <Text style={[styles.successTitle, { color: theme.colors.text }]}>
            Check-in Complete!
          </Text>
          
          <Text style={[styles.successSubtitle, { color: theme.colors.textSecondary }]}>
            Thank you for taking the time to reflect on your day. Your insights help us understand your patterns better.
          </Text>

          {/* Summary */}
          <View style={styles.summarySection}>
            <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
              Today's Summary
            </Text>
            
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Mood:
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                {params.moodLabel}
              </Text>
            </View>

            {params.location && params.location !== 'Not specified' && (
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                  Location:
                </Text>
                <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                  {params.location}
                </Text>
              </View>
            )}

            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Activity Level:
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                {params.activityLevel}/10
              </Text>
            </View>

            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                Sleep:
              </Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                {params.sleepDuration} hours
              </Text>
            </View>
          </View>

          {/* Insights Preview */}
          <View style={styles.insightSection}>
            <Text style={[styles.insightTitle, { color: theme.colors.text }]}>
              💡 Quick Insight
            </Text>
            <Text style={[styles.insightText, { color: theme.colors.textSecondary }]}>
              You've been tracking your mood consistently! Keep up the great work.
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="View My Insights"
            variant="secondary"
            onPress={handleViewInsights}
            style={styles.actionButton}
          />
          
          <Button
            title="Continue to Journal"
            variant="primary"
            onPress={handleContinue}
            style={styles.actionButton}
          />
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressSection}>
          <View style={styles.progressIndicator}>
            <View style={[styles.progressDot, { backgroundColor: theme.colors.primary }]} />
            <View style={[styles.progressDot, { backgroundColor: theme.colors.primary }]} />
            <View style={[styles.progressDot, { backgroundColor: theme.colors.primary }]} />
            <View style={[styles.progressDot, { backgroundColor: theme.colors.primary }]} />
            <View style={[styles.progressDot, styles.progressDotActive, { backgroundColor: theme.colors.primary }]} />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.textTertiary }]}>
            Complete! 🎉
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  successCard: {
    padding: 32,
    alignItems: 'center',
    gap: 20,
  },
  successIcon: {
    marginBottom: 8,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  summarySection: {
    width: '100%',
    gap: 12,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  insightSection: {
    width: '100%',
    gap: 8,
    marginTop: 16,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    width: '100%',
  },
  progressSection: {
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  progressIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressDotActive: {
    width: 16,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
  },
});