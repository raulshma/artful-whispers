import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
} from "react-native-reanimated";
import { AnimatedPageWrapper } from "@/components/ui/AnimatedPageWrapper";
import { ShadowFriendlyAnimation } from "@/components/ui/ShadowFriendlyAnimation";
import { SkiaLoadingAnimation } from "@/components/ui/SkiaLoadingAnimation";
import { getCheckIns, type CheckInResponse } from "@/services/checkinService";
import MoodCheckInCard from "@/components/MoodCheckInCard";
import CheckInQuickStats from "@/components/CheckInQuickStats";
import RecentCheckInsCard from "@/components/RecentCheckInsCard";

export default function CheckInScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [checkIns, setCheckIns] = useState<CheckInResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCheckIns = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await getCheckIns(10, 0);
      setCheckIns(data);
    } catch (error) {
      console.error("Failed to fetch check-ins:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load check-ins"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCheckIns();
  }, []);

  const onRefresh = () => {
    fetchCheckIns(true);
  };

  const getMoodIcon = (mood: string) => {
    switch (mood.toLowerCase()) {
      case "overjoyed":
      case "happy":
        return "happy";
      case "neutral":
        return "remove";
      case "sad":
        return "sad";
      case "depressed":
        return "cloud";
      case "angry":
        return "flash";
      case "anxious":
        return "alert-circle";
      case "calm":
        return "leaf";
      default:
        return "ellipse";
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood.toLowerCase()) {
      case "overjoyed":
      case "happy":
        return theme.colors.mood?.happy || theme.colors.primary;
      case "neutral":
        return theme.colors.textSecondary;
      case "sad":
        return theme.colors.mood?.sad || "#6B7280";
      case "depressed":
        return theme.colors.mood?.sad || "#4B5563";
      case "angry":
        return theme.colors.mood?.angry || "#EF4444";
      case "anxious":
        return theme.colors.mood?.anxious || "#F59E0B";
      case "calm":
        return theme.colors.mood?.calm || "#10B981";
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStreakCount = () => {
    // Simple streak calculation - could be enhanced
    let streak = 0;
    const today = new Date();
    const sortedCheckIns = checkIns
      .slice()
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    for (const checkIn of sortedCheckIns) {
      const checkInDate = new Date(checkIn.createdAt);
      const daysDiff = Math.floor(
        (today.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const getThisMonthCount = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return checkIns.filter((checkIn) => {
      const checkInDate = new Date(checkIn.createdAt);
      return checkInDate >= startOfMonth;
    }).length;
  };

  const getLatestMood = () => {
    if (checkIns.length === 0)
      return { mood: "neutral", label: "Ready to check in" };

    const latest = checkIns[0];
    return { mood: latest.mood, label: `Feeling ${latest.mood}` };
  };

  const handleCheckInPress = () => {
    router.push("/checkin/step1");
  };

  const handleStatsPress = () => {
    // Navigate to detailed stats view
    console.log("Check-in stats pressed");
  };

  const handleRecentPress = () => {
    // Navigate to all check-ins view
    console.log("Recent check-ins pressed");
  };

  const handleCheckInItemPress = (checkIn: CheckInResponse) => {
    // Navigate to check-in details
    console.log("Check-in item pressed:", checkIn.id);
  };
  if (loading) {
    return (
      <AnimatedPageWrapper animationType="fadeIn">
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.colors.background,
              paddingTop: insets.top,
            },
          ]}
        >
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <Animated.View
                entering={FadeIn.duration(300)}
                style={styles.loadingContainer}
              >
                <SkiaLoadingAnimation
                  size={120}
                  color={theme.colors.primary}
                  variant="morphing"
                  visible={true}
                />
                <Text
                  style={[
                    styles.loadingText,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Loading your check-ins...
                </Text>
                <Text
                  style={[
                    styles.loadingSubtext,
                    { color: theme.colors.textTertiary },
                  ]}
                >
                  Preparing your mood insights
                </Text>
              </Animated.View>
            </View>
          </ScrollView>
        </View>
      </AnimatedPageWrapper>
    );
  }

  const latestMood = getLatestMood();
  const streakCount = getStreakCount();
  const thisMonthCount = getThisMonthCount();

  return (
    <AnimatedPageWrapper animationType="fadeIn">
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            paddingTop: insets.top,
          },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        >
          <View style={styles.content}>
            {/* Refreshing indicator */}
            {refreshing && (
              <Animated.View
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
                style={styles.refreshingContainer}
              >
                <SkiaLoadingAnimation
                  size={40}
                  color={theme.colors.primary}
                  variant="orbital"
                  visible={refreshing}
                />
              </Animated.View>
            )}

            {/* Main Content */}
            <Animated.View
              entering={FadeIn.delay(100).duration(400)}
              style={styles.contentContainer}
            >
              {/* Main Mood Check-in Card */}
              <ShadowFriendlyAnimation index={0} animationType="slideUp">
                <MoodCheckInCard
                  title="How are you feeling?"
                  subtitle={latestMood.label}
                  moodIcon={getMoodIcon(latestMood.mood)}
                  moodColor={getMoodColor(latestMood.mood)}
                  onPress={handleCheckInPress}
                />
              </ShadowFriendlyAnimation>

              {/* Quick Stats Card */}
              <ShadowFriendlyAnimation index={1} animationType="slideUp">
                <CheckInQuickStats
                  title="Your Progress"
                  subtitle="Check-in statistics"
                  stats={[
                    {
                      value: streakCount,
                      label: "Day Streak",
                      icon: "flame",
                      color: theme.colors.primary,
                    },
                    {
                      value: thisMonthCount,
                      label: "This Month",
                      icon: "calendar",
                      color: theme.colors.mood?.happy || theme.colors.primary,
                    },
                    {
                      value: checkIns.length,
                      label: "Total",
                      icon: "checkmark-circle",
                      color: theme.colors.mood?.calm || theme.colors.primary,
                    },
                  ]}
                  onPress={handleStatsPress}
                />
              </ShadowFriendlyAnimation>

              {/* Recent Check-ins Card */}
              <ShadowFriendlyAnimation index={2} animationType="slideUp">
                <RecentCheckInsCard
                  title="Recent Check-ins"
                  subtitle="Your latest mood tracking"
                  checkIns={checkIns}
                  onPress={handleRecentPress}
                  onItemPress={handleCheckInItemPress}
                  loading={false}
                  error={error}
                  onRetry={() => fetchCheckIns()}
                />
              </ShadowFriendlyAnimation>
            </Animated.View>
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
  contentContainer: {
    flex: 1,
  },
  refreshingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
});
