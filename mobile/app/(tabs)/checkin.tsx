import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import MoodCheckIn from "@/components/MoodCheckIn";
import { AnimatedPageWrapper } from "@/components/ui/AnimatedPageWrapper";

export default function CheckInScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [showMoodCheckIn, setShowMoodCheckIn] = useState(false);

  const handleStartCheckIn = () => {
    setShowMoodCheckIn(true);
  };

  const handleCheckInComplete = (responses: Record<string, any>) => {
    console.log("Check-in completed:", responses);
    setShowMoodCheckIn(false);
    // Here you would typically save the mood data to your backend
    // and show a success message
  };

  const handleCheckInClose = () => {
    setShowMoodCheckIn(false);
  };

  if (showMoodCheckIn) {
    return (
      <MoodCheckIn
        onComplete={handleCheckInComplete}
        onClose={handleCheckInClose}
      />
    );
  }
  return (
    <AnimatedPageWrapper animationType="scaleIn">
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.backgroundGreen,
            paddingTop: insets.top,
          },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              How are you feeling this day?
            </Text>
          </View>

          {/* Main Mood Check-in Card */}
          <View
            style={[styles.moodCard, { backgroundColor: theme.colors.card }]}
          >
            <View style={styles.moodFace}>
              <Ionicons name="happy" size={80} color={theme.colors.primary} />
            </View>

            <Text
              style={[styles.moodPrompt, { color: theme.colors.textSecondary }]}
            >
              I'm Feeling Overjoyed
            </Text>

            <TouchableOpacity
              style={[
                styles.checkInButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleStartCheckIn}
              activeOpacity={0.8}
            >
              <Text style={styles.checkInButtonText}>Set Mood ✓</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View
              style={[styles.statItem, { backgroundColor: theme.colors.card }]}
            >
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                7
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Day Streak
              </Text>
            </View>

            <View
              style={[styles.statItem, { backgroundColor: theme.colors.card }]}
            >
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                24
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                This Month
              </Text>
            </View>
          </View>

          {/* Recent Check-ins */}
          <View
            style={[styles.recentCard, { backgroundColor: theme.colors.card }]}
          >
            <Text style={[styles.recentTitle, { color: theme.colors.text }]}>
              Recent Check-ins
            </Text>
            <View style={styles.recentList}>
              <View style={styles.recentItem}>
                <Ionicons
                  name="happy"
                  size={20}
                  color={theme.colors.mood.happy}
                />
                <View style={styles.recentContent}>
                  <Text
                    style={[styles.recentMood, { color: theme.colors.text }]}
                  >
                    Happy
                  </Text>
                  <Text
                    style={[
                      styles.recentTime,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    2 hours ago
                  </Text>
                </View>
              </View>

              <View style={styles.recentItem}>
                <Ionicons
                  name="leaf"
                  size={20}
                  color={theme.colors.mood.calm}
                />
                <View style={styles.recentContent}>
                  <Text
                    style={[styles.recentMood, { color: theme.colors.text }]}
                  >
                    Calm
                  </Text>
                  <Text
                    style={[
                      styles.recentTime,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Yesterday
                  </Text>
                </View>
              </View>

              <View style={styles.recentItem}>
                <Ionicons
                  name="alert-circle"
                  size={20}
                  color={theme.colors.mood.anxious}
                />
                <View style={styles.recentContent}>
                  <Text
                    style={[styles.recentMood, { color: theme.colors.text }]}
                  >
                    Anxious
                  </Text>
                  <Text
                    style={[
                      styles.recentTime,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    2 days ago
                  </Text>
                </View>
              </View>            </View>
          </View>
        </ScrollView>
      </View>
    </AnimatedPageWrapper>
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
  header: {
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
  },
  moodCard: {
    marginBottom: 24,
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
  },
  moodFace: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  moodPrompt: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 24,
  },
  checkInButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    minWidth: 200,
    alignItems: "center",
  },
  checkInButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
  },
  recentCard: {
    padding: 20,
    borderRadius: 16,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  recentList: {
    gap: 12,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  recentContent: {
    flex: 1,
    marginLeft: 12,
  },
  recentMood: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  recentTime: {
    fontSize: 14,
  },
});
