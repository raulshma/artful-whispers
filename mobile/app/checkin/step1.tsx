import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useCheckIn } from "@/contexts/CheckInContext";
import {
  Header,
  Button,
  Card,
  MoodSelector,
  DEFAULT_MOODS,
} from "@/components/ui";
import * as Haptics from "expo-haptics";

export default function CheckinStep1() {
  const { theme } = useTheme();
  const router = useRouter();
  const { checkInData, updateCheckInData } = useCheckIn();
  const [selectedMood, setSelectedMood] = useState<any>(
    checkInData.mood ? DEFAULT_MOODS.find(m => m.id === checkInData.mood) : null
  );

  const handleMoodChange = (mood: any) => {
    setSelectedMood(mood);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleContinue = () => {
    if (selectedMood) {
      updateCheckInData({
        mood: selectedMood.id,
        moodLabel: selectedMood.label,
      });
      router.push("/checkin/step2" as any);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header
        title="Check In"
        showBackButton
        onBackPress={() => router.back()}
      />

      <View style={styles.content}>
        <View style={styles.questionSection}>
          <Text style={[styles.questionText, { color: theme.colors.text }]}>
            How are you feeling?
          </Text>
          <Text
            style={[
              styles.questionSubtext,
              { color: theme.colors.textSecondary },
            ]}
          >
            Take a moment to check in with yourself
          </Text>
        </View>

        <Card style={styles.moodCard}>
          <MoodSelector
            moods={DEFAULT_MOODS}
            onMoodChange={handleMoodChange}
            initialMood={selectedMood}
            sliderWidth={280}
          />
        </Card>

        {selectedMood && (
          <View style={styles.selectedMoodSection}>
            <Text
              style={[styles.selectedMoodText, { color: theme.colors.text }]}
            >
              You're feeling:
            </Text>
            <Text
              style={[
                styles.selectedMoodLabel,
                { color: theme.colors.primary },
              ]}
            >
              {selectedMood.label}
            </Text>
          </View>
        )}

        <View style={styles.buttonSection}>
          <Button
            title="Set Mood"
            variant="primary"
            onPress={handleContinue}
            disabled={!selectedMood}
            style={styles.continueButton}
          />
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressIndicator}>
            <View
              style={[
                styles.progressDot,
                styles.progressDotActive,
                { backgroundColor: theme.colors.primary },
              ]}
            />
            <View
              style={[
                styles.progressDot,
                { backgroundColor: theme.colors.border },
              ]}
            />
            <View
              style={[
                styles.progressDot,
                { backgroundColor: theme.colors.border },
              ]}
            />
            <View
              style={[
                styles.progressDot,
                { backgroundColor: theme.colors.border },
              ]}
            />
            <View
              style={[
                styles.progressDot,
                { backgroundColor: theme.colors.border },
              ]}
            />
          </View>
          <Text
            style={[styles.progressText, { color: theme.colors.textTertiary }]}
          >
            Step 1 of 5
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
    justifyContent: "space-between",
  },
  questionSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  questionText: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  questionSubtext: {
    fontSize: 16,
    textAlign: "center",
  },
  moodCard: {
    padding: 32,
    alignItems: "center",
    marginBottom: 24,
  },
  selectedMoodSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  selectedMoodText: {
    fontSize: 18,
    marginBottom: 4,
  },
  selectedMoodLabel: {
    fontSize: 24,
    fontWeight: "bold",
  },
  buttonSection: {
    marginBottom: 24,
  },
  continueButton: {
    width: "100%",
  },
  progressSection: {
    alignItems: "center",
    gap: 12,
  },
  progressIndicator: {
    flexDirection: "row",
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
  },
});
