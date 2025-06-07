import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useCheckIn } from "@/contexts/CheckInContext";
import {
  Header,
  Button,
  Card,
  ToggleButton,
  Slider,
} from "@/components/ui";
import * as Haptics from "expo-haptics";

const MOOD_CAUSES = [
  { id: "work-stress", label: "Work stress" },
  { id: "relationship", label: "Relationship" },
  { id: "health", label: "Health" },
  { id: "family", label: "Family" },
  { id: "money", label: "Money" },
  { id: "sleep", label: "Sleep" },
  { id: "weather", label: "Weather" },
  { id: "exercise", label: "Exercise" },
  { id: "social-media", label: "Social media" },
  { id: "news", label: "News" },
  { id: "achievement", label: "Achievement" },
  { id: "creativity", label: "Creativity" },
];

export default function CheckinStep2() {
  const { theme } = useTheme();
  const router = useRouter();
  const { checkInData, updateCheckInData } = useCheckIn();

  const [selectedCauses, setSelectedCauses] = useState<string[]>(
    checkInData.moodCauses || []
  );
  const [moodIntensity, setMoodIntensity] = useState(
    checkInData.moodIntensity || 5
  );
  const [additionalNotes, setAdditionalNotes] = useState(
    checkInData.notes || ""
  );

  const handleCauseToggle = (cause: string) => {
    setSelectedCauses((prev) => {
      const isSelected = prev.includes(cause);
      if (isSelected) {
        return prev.filter((c) => c !== cause);
      } else {
        return [...prev, cause];
      }
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleContinue = () => {
    updateCheckInData({
      moodCauses: selectedCauses,
      moodIntensity: moodIntensity,
      notes: additionalNotes,
    });
    router.push("/checkin/step3" as any);
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

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.questionSection}>
            <Text style={[styles.questionText, { color: theme.colors.text }]}>
              Why do you feel {checkInData.moodLabel?.toLowerCase()}?
            </Text>
            <Text
              style={[
                styles.questionSubtext,
                { color: theme.colors.textSecondary },
              ]}
            >
              Select what's influencing your mood today
            </Text>
          </View>

          {/* Causes Selection */}
          <Card style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              What's contributing to this feeling?
            </Text>
            <View style={styles.causesGrid}>
              {MOOD_CAUSES.map((cause) => (
                <ToggleButton
                  key={cause.id}
                  title={cause.label}
                  selected={selectedCauses.includes(cause.id)}
                  onPress={() => handleCauseToggle(cause.id)}
                />
              ))}
            </View>
          </Card>

          {/* Mood Intensity */}
          <Card style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Mood Intensity
            </Text>
            <Text
              style={[
                styles.sectionSubtitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              How intense is this feeling? (1-10)
            </Text>
            <View style={styles.sliderContainer}>
              <Slider
                value={moodIntensity}
                onValueChange={setMoodIntensity}
                min={1}
                max={10}
                step={1}
                showValue={true}
              />
            </View>
          </Card>

          {/* Additional Notes */}
          <Card style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Additional Notes
            </Text>
            <Text
              style={[
                styles.sectionSubtitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              Anything else you'd like to share?
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: theme.colors.text,
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="Optional notes..."
              placeholderTextColor={theme.colors.textTertiary}
              value={additionalNotes}
              onChangeText={setAdditionalNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </Card>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          variant="primary"
          onPress={handleContinue}
          style={styles.continueButton}
        />

        <View style={styles.progressSection}>
          <View style={styles.progressIndicator}>
            <View
              style={[
                styles.progressDot,
                { backgroundColor: theme.colors.primary },
              ]}
            />
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
          </View>
          <Text
            style={[styles.progressText, { color: theme.colors.textTertiary }]}
          >
            Step 2 of 5
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  questionSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  questionText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  questionSubtext: {
    fontSize: 16,
    textAlign: "center",
  },
  sectionCard: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  causesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  sliderContainer: {
    paddingHorizontal: 16,
  },
  textArea: {
    marginTop: 8,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
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
  placeholderText: {
    fontSize: 16,
    fontStyle: "italic",
    marginTop: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
    minHeight: 80,
  },
});
