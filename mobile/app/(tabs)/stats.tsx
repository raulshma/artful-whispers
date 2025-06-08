import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/contexts/ThemeContext";
import Animated, { 
  FadeIn, 
  FadeOut, 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withDelay 
} from 'react-native-reanimated';
import JournalStats from "@/components/JournalStats";
import MoodStatsCard from "@/components/MoodStatsCard";
import MoodCalendar from "@/components/MoodCalendar";
import JournalAdvancedStats from "@/components/JournalAdvancedStats";
import MoodAdvancedStats from "@/components/MoodAdvancedStats";
import CalendarAdvancedStats from "@/components/CalendarAdvancedStats";
import { AnimatedPageWrapper } from "@/components/ui/AnimatedPageWrapper";
import { ShadowFriendlyAnimation } from "@/components/ui/ShadowFriendlyAnimation";
import { SkiaLoadingAnimation } from "@/components/ui/SkiaLoadingAnimation";
import { fetchJournalSummary, fetchMoodCheckinDistribution, fetchCalendarData } from "@/lib/api";

// Mock calendar data - will be replaced when calendar integration is implemented

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
  const [selectedPeriod, setSelectedPeriod] = useState<string>("currentMonth");
  
  // Modal visibility states
  const [journalStatsVisible, setJournalStatsVisible] = useState(false);
  const [moodStatsVisible, setMoodStatsVisible] = useState(false);
  const [calendarStatsVisible, setCalendarStatsVisible] = useState(false);

  // Fetch journal summary stats
  const {
    data: journalStats,
    error: journalError,
    isLoading: journalLoading,
    refetch: refetchJournalStats,
  } = useQuery({
    queryKey: ["journalStats", selectedPeriod],
    queryFn: () => fetchJournalSummary(selectedPeriod),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch mood check-in distribution
  const {
    data: moodDistribution,
    error: moodError,
    isLoading: moodLoading,
    refetch: refetchMoodStats,
  } = useQuery({
    queryKey: ["moodDistribution", selectedPeriod],
    queryFn: () => fetchMoodCheckinDistribution(selectedPeriod),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch calendar data for current month
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  const {
    data: calendarData,
    error: calendarError,
    isLoading: calendarLoading,
    refetch: refetchCalendarData,
  } = useQuery({
    queryKey: ["calendarData", currentYear, currentMonth],
    queryFn: () => fetchCalendarData(currentYear, currentMonth),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchJournalStats(), refetchMoodStats(), refetchCalendarData()]);
    } catch (error) {
      console.error("Error refreshing stats:", error);
    } finally {
      setRefreshing(false);
    }
  };
  const handleJournalStatsPress = () => {
    setJournalStatsVisible(true);
  };

  const handleMoodStatsPress = () => {
    setMoodStatsVisible(true);
  };

  const handleCalendarPress = () => {
    setCalendarStatsVisible(true);
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
    <AnimatedPageWrapper animationType="fadeIn">
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
          }        >
          <View style={styles.content}>
            {/* Refreshing indicator */}
            {refreshing && (
              <View style={styles.refreshingContainer}>
                <SkiaLoadingAnimation
                  size={40}
                  color={theme.colors.primary}
                  variant="breathing"
                  visible={refreshing}
                />
              </View>
            )}            {/* Loading State */}
            {(journalLoading || moodLoading || calendarLoading) && (
              <Animated.View 
                entering={FadeIn.duration(300)}
                exiting={FadeOut.duration(300)}
                style={styles.loadingContainer}
              >
                <SkiaLoadingAnimation
                  size={120}
                  color={theme.colors.primary}
                  variant="orbital"
                  visible={true}
                />
                <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                  Loading your stats...
                </Text>
                <Text style={[styles.loadingSubtext, { color: theme.colors.textTertiary }]}>
                  Analyzing your journal data
                </Text>
              </Animated.View>
            )}{/* Error State */}
            {(journalError || moodError || calendarError) && (
              <Animated.View 
                entering={FadeIn.duration(300)}
                exiting={FadeOut.duration(300)}
                style={styles.errorContainer}
              >
                <SkiaLoadingAnimation
                  size={50}
                  color={theme.colors.semantic.error}
                  variant="ripple"
                  visible={true}
                />
                <Text style={[styles.errorText, { color: theme.colors.semantic.error }]}>
                  Failed to load stats. Pull to refresh.
                </Text>
              </Animated.View>
            )}

            {/* Content */}
            {!journalLoading && !moodLoading && !calendarLoading && (
              <Animated.View
                entering={FadeIn.delay(150).duration(400)}
                style={styles.contentContainer}
              >
                {/* Main Journal Stats Card */}
                {journalStats && (
                  <ShadowFriendlyAnimation index={0} animationType="slideUp">
                    <JournalStats
                      title="Journal Stats"
                      subtitle={`Your Journal Stats for ${getPeriodDisplayName(selectedPeriod)}`}
                      data={journalStats}
                      onPress={handleJournalStatsPress}
                    />
                  </ShadowFriendlyAnimation>
                )}

                {/* Most Frequent Emotion Card */}
                {moodDistribution && moodDistribution.length > 0 && (
                  <ShadowFriendlyAnimation index={1} animationType="slideUp">
                    <MoodStatsCard
                      title={moodDistribution[0]?.mood || "Mood Stats"}
                      subtitle="Most frequent emotion"
                      stats={moodDistribution}
                      onPress={handleMoodStatsPress}
                    />
                  </ShadowFriendlyAnimation>
                )}

                {/* Empty state when no mood data */}
                {moodDistribution && moodDistribution.length === 0 && (
                  <ShadowFriendlyAnimation index={1} animationType="slideUp">
                    <View style={styles.emptyStateContainer}>
                      <SkiaLoadingAnimation
                        size={60}
                        color={theme.colors.textSecondary}
                        variant="breathing"
                        visible={true}
                      />
                      <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                        No mood check-ins yet. Start tracking your moods to see statistics.
                      </Text>
                    </View>
                  </ShadowFriendlyAnimation>
                )}                {/* Calendar View */}
                {calendarData && calendarData.length > 0 ? (
                  <ShadowFriendlyAnimation index={2} animationType="slideUp">
                    <MoodCalendar
                      title={`${calendarData.filter(day => day.hasEntry).length}/${calendarData.length}`}
                      subtitle="Journals written this month"
                      days={calendarData}
                      currentMonth={new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                      onDayPress={handleCalendarDayPress}
                      onAddPress={handleAddJournalPress}
                      onPress={handleCalendarPress}
                    />
                  </ShadowFriendlyAnimation>
                ) : (
                  /* Fallback calendar view until backend endpoint is fully working */
                  <ShadowFriendlyAnimation index={2} animationType="slideUp">
                    <MoodCalendar
                      title="0/31"
                      subtitle="Journals written this month"
                      days={mockCalendarDays}
                      currentMonth={new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                      onDayPress={handleCalendarDayPress}
                      onAddPress={handleAddJournalPress}
                      onPress={handleCalendarPress}
                    />
                  </ShadowFriendlyAnimation>
                )}
              </Animated.View>
            )}          </View>
        </ScrollView>
        
        {/* Advanced Stats Modals */}
        {journalStats && (
          <JournalAdvancedStats
            visible={journalStatsVisible}
            onClose={() => setJournalStatsVisible(false)}
            data={journalStats}
            period={selectedPeriod}
          />
        )}
        
        {moodDistribution && (
          <MoodAdvancedStats
            visible={moodStatsVisible}
            onClose={() => setMoodStatsVisible(false)}
            stats={moodDistribution}
            period={selectedPeriod}
          />
        )}
        
        <CalendarAdvancedStats
          visible={calendarStatsVisible}
          onClose={() => setCalendarStatsVisible(false)}
          days={calendarData || mockCalendarDays}
          currentMonth={new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
          onDayPress={handleCalendarDayPress}
        />
      </View>
    </AnimatedPageWrapper>
  );
}

function getPeriodDisplayName(period: string): string {
  switch (period) {
    case 'currentMonth':
      return 'this month';
    case 'last30days':
      return 'last 30 days';
    case 'last7days':
      return 'last 7 days';
    default:
      return 'all time';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },  content: {
    paddingBottom: 100, // Space for tab bar
  },
  contentContainer: {
    flex: 1,
  },
  refreshingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
  },
  errorContainer: {
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyStateContainer: {
    padding: 32,
    marginHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(158, 158, 158, 0.1)',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
