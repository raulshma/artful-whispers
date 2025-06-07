import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Text,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";
import JournalStats from "@/components/JournalStats";
import MoodStatsCard from "@/components/MoodStatsCard";
import MoodCalendar from "@/components/MoodCalendar";
import { AnimatedPageWrapper } from "@/components/ui/AnimatedPageWrapper";
import { StaggeredAnimation } from "@/components/ui/StaggeredAnimation";

// Mock data based on the designs
const mockJournalStats = {
  positive: 21,
  neutral: 13,
  negative: 9,
  skipped: 8,
  total: 51,
};

const mockMoodStats = [
  { mood: "Happy", count: 99, color: "#9BC53D", icon: "happy", percentage: 68 },
  {
    mood: "Content",
    count: 87,
    color: "#FFB347",
    icon: "sunny",
    percentage: 60,
  },
  { mood: "Calm", count: 25, color: "#8DB596", icon: "leaf", percentage: 17 },
  {
    mood: "Worried",
    count: 19,
    color: "#E17055",
    icon: "alert-circle",
    percentage: 13,
  },
  { mood: "Sad", count: 7, color: "#6B9BD1", icon: "sad", percentage: 5 },
];

const mockCalendarDays = [
  { day: 1, mood: null, hasEntry: false },
  { day: 2, mood: null, hasEntry: false },
  { day: 3, mood: "happy" as const, hasEntry: true },
  { day: 4, mood: "happy" as const, hasEntry: true },
  { day: 5, mood: "happy" as const, hasEntry: true },
  { day: 6, mood: "neutral" as const, hasEntry: true },
  { day: 7, mood: null, hasEntry: false },
  { day: 8, mood: "happy" as const, hasEntry: true },
  { day: 9, mood: "neutral" as const, hasEntry: true },
  { day: 10, mood: null, hasEntry: false },
  { day: 11, mood: "neutral" as const, hasEntry: true },
  { day: 12, mood: "happy" as const, hasEntry: true },
  { day: 13, mood: "negative" as const, hasEntry: true },
  { day: 14, mood: "negative" as const, hasEntry: true },
  { day: 15, mood: null, hasEntry: false },
  { day: 16, mood: null, hasEntry: false },
  { day: 17, mood: null, hasEntry: false },
  { day: 18, mood: null, hasEntry: false },
  { day: 19, mood: null, hasEntry: false },
  { day: 20, mood: null, hasEntry: false },
  { day: 21, mood: null, hasEntry: false },
  { day: 22, mood: null, hasEntry: false },
  { day: 23, mood: null, hasEntry: false },
  { day: 24, mood: null, hasEntry: false },
  { day: 25, mood: null, hasEntry: false },
  { day: 26, mood: null, hasEntry: false },
  { day: 27, mood: null, hasEntry: false },
  { day: 28, mood: null, hasEntry: false },
  { day: 29, mood: null, hasEntry: false },
  { day: 30, mood: null, hasEntry: false },
  { day: 31, mood: null, hasEntry: false },
];

export default function JournalStatsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleJournalStatsPress = () => {
    // Navigate to detailed stats view
    console.log("Journal stats pressed");
  };

  const handleMoodStatsPress = () => {
    // Navigate to mood analytics view
    console.log("Mood stats pressed");
  };

  const handleCalendarDayPress = (day: number) => {
    // Navigate to entry for that day or show day details
    console.log("Calendar day pressed:", day);
  };
  const handleAddJournalPress = () => {
    // Navigate to add new journal entry
    console.log("Add journal pressed");
  };
  return (
    <AnimatedPageWrapper animationType="slideUp">
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.background, paddingTop: insets.top },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.primary}
            />
          }
        >
          {" "}
          <View style={styles.content}>
            {/* Main Journal Stats Card */}
            <StaggeredAnimation index={0} animationType="slideUp">
              <JournalStats
                title="Journal Stats"
                subtitle="Your Journal Stats for Feb 2025"
                data={mockJournalStats}
                onPress={handleJournalStatsPress}
              />
            </StaggeredAnimation>

            {/* Most Frequent Emotion Card */}
            <StaggeredAnimation index={1} animationType="slideUp">
              <MoodStatsCard
                title="Happy"
                subtitle="Most frequent emotion"
                stats={mockMoodStats}
                onPress={handleMoodStatsPress}
              />
            </StaggeredAnimation>

            {/* Calendar View */}
            <StaggeredAnimation index={2} animationType="slideUp">
              <MoodCalendar
                title="24/31"
                subtitle="Journals written this month"
                days={mockCalendarDays}
                currentMonth="February 2025"
                onDayPress={handleCalendarDayPress}
                onAddPress={handleAddJournalPress}
              />
            </StaggeredAnimation>
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
    paddingBottom: 100, // Space for tab bar
  },
});
