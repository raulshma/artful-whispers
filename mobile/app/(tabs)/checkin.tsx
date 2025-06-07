import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  Header,
  HeaderIconButton,
  Button,
  MoodSelector,
  Card
} from '@/components/ui';
import { MoodIconGrid } from '@/components/skia/MoodIcons';

const MOOD_OPTIONS = [
  'happy',
  'calm',
  'excited',
  'neutral',
  'anxious',
  'sad',
  'angry',
  'frustrated'
];

export default function CheckInScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<string | undefined>();

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
  };

  const handleContinue = () => {
    if (selectedMood) {
      // Navigate to the full check-in flow
      router.push('/checkin/step1' as any);
    }
  };

  const handleQuickCheckin = () => {
    // Quick check-in without going through full flow
    if (selectedMood) {
      // Save quick mood entry
      console.log('Quick check-in:', selectedMood);
      // Show success feedback
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title="How are you feeling?"
        variant="large"
        rightComponent={
          <HeaderIconButton
            iconName="questionmark.circle"
            onPress={() => {
              // Show help/info modal
            }}
          />
        }
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Mood Selection */}
        <Card style={styles.moodCard}>
          <MoodIconGrid
            moods={MOOD_OPTIONS}
            selectedMood={selectedMood}
            onMoodSelect={handleMoodSelect}
            iconSize={56}
          />
        </Card>

        {/* Selected Mood Display */}
        {selectedMood && (
          <Card style={styles.selectedMoodCard}>
            <View style={styles.selectedMoodContent}>
              <Text style={[styles.selectedMoodText, { color: theme.colors.text }]}>
                You're feeling: {selectedMood}
              </Text>
            </View>
          </Card>
        )}

        {/* Action Buttons */}
        {selectedMood && (
          <View style={styles.actionButtons}>
            <Button
              title="Quick Check-in"
              variant="secondary"
              onPress={handleQuickCheckin}
              style={styles.actionButton}
            />
            
            <Button
              title="Tell me more"
              variant="primary"
              onPress={handleContinue}
              style={styles.actionButton}
            />
          </View>
        )}

        {/* Recent Check-ins */}
        <Card style={styles.recentCard}>
          <View style={styles.recentHeader}>
            <Text style={[styles.recentTitle, { color: theme.colors.text }]}>
              Recent Check-ins
            </Text>
          </View>
          
          {/* This would be populated with actual recent data */}
          <View style={styles.recentList}>
            <View style={styles.recentItem}>
              <View style={styles.recentMoodDot} />
              <View style={styles.recentContent}>
                <Text style={[styles.recentMood, { color: theme.colors.text }]}>
                  Happy
                </Text>
                <Text style={[styles.recentTime, { color: theme.colors.textSecondary }]}>
                  2 hours ago
                </Text>
              </View>
            </View>
            
            <View style={styles.recentItem}>
              <View style={[styles.recentMoodDot, { backgroundColor: theme.colors.mood.calm }]} />
              <View style={styles.recentContent}>
                <Text style={[styles.recentMood, { color: theme.colors.text }]}>
                  Calm
                </Text>
                <Text style={[styles.recentTime, { color: theme.colors.textSecondary }]}>
                  Yesterday
                </Text>
              </View>
            </View>
            
            <View style={styles.recentItem}>
              <View style={[styles.recentMoodDot, { backgroundColor: theme.colors.mood.anxious }]} />
              <View style={styles.recentContent}>
                <Text style={[styles.recentMood, { color: theme.colors.text }]}>
                  Anxious
                </Text>
                <Text style={[styles.recentTime, { color: theme.colors.textSecondary }]}>
                  2 days ago
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  moodCard: {
    marginBottom: 24,
    padding: 24,
  },
  selectedMoodCard: {
    marginBottom: 24,
    padding: 20,
  },
  selectedMoodContent: {
    alignItems: 'center',
  },
  selectedMoodText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionButtons: {
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    width: '100%',
  },
  recentCard: {
    padding: 20,
  },
  recentHeader: {
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  recentList: {
    gap: 12,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  recentMoodDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    marginRight: 12,
  },
  recentContent: {
    flex: 1,
  },
  recentMood: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  recentTime: {
    fontSize: 14,
  },
});