import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useCheckIn } from "@/contexts/CheckInContext";
import { Header, Button, Card, ToggleButton } from "@/components/ui";
import * as Haptics from "expo-haptics";

const COMPANIONS = [
  { id: "alone", label: "Alone" },
  { id: "family", label: "Family" },
  { id: "friends", label: "Friends" },
  { id: "colleagues", label: "Colleagues" },
  { id: "partner", label: "Partner" },
  { id: "pets", label: "Pets" },
  { id: "strangers", label: "Strangers" },
  { id: "acquaintances", label: "Acquaintances" },
];

export default function CheckinStep3() {
  const { theme } = useTheme();
  const router = useRouter();
  const { checkInData, updateCheckInData } = useCheckIn();

  const [selectedCompanions, setSelectedCompanions] = useState<string[]>(
    checkInData.companions || []
  );

  const handleCompanionToggle = (companionId: string) => {
    setSelectedCompanions((prev) => {
      const isSelected = prev.includes(companionId);
      if (isSelected) {
        return prev.filter((c) => c !== companionId);
      } else {
        return [...prev, companionId];
      }
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleContinue = () => {
    updateCheckInData({
      companions: selectedCompanions,
    });
    router.push("/checkin/step4" as any);
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
              Who are you currently with?
            </Text>
            <Text
              style={[
                styles.questionSubtext,
                { color: theme.colors.textSecondary },
              ]}
            >
              Select all that apply
            </Text>
          </View>

          <Card style={styles.companionsCard}>
            <View style={styles.companionsGrid}>
              {COMPANIONS.map((companion) => (
                <ToggleButton
                  key={companion.id}
                  title={companion.label}
                  selected={selectedCompanions.includes(companion.id)}
                  onPress={() => handleCompanionToggle(companion.id)}
                />
              ))}
            </View>
          </Card>

          {selectedCompanions.length > 0 && (
            <Card style={styles.selectionCard}>
              <Text
                style={[styles.selectionTitle, { color: theme.colors.text }]}
              >
                Selected:
              </Text>
              <Text
                style={[
                  styles.selectionText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {selectedCompanions
                  .map((id) => COMPANIONS.find((c) => c.id === id)?.label)
                  .join(", ")}
              </Text>
            </Card>
          )}
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
          </View>
          <Text
            style={[styles.progressText, { color: theme.colors.textTertiary }]}
          >
            Step 3 of 5
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
  companionsCard: {
    padding: 20,
    marginBottom: 16,
  },
  companionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectionCard: {
    padding: 16,
    marginBottom: 16,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  selectionText: {
    fontSize: 14,
    lineHeight: 20,
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
});
