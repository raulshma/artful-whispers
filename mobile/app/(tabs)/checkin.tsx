import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPageWrapper } from "@/components/ui/AnimatedPageWrapper";
import { LoadingAnimation } from "@/components/ui";
import { getCheckIns, type CheckInResponse } from "@/services/checkinService";
import { format, isToday, isYesterday } from "date-fns";

export default function CheckInScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [checkIns, setCheckIns] = useState<CheckInResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartCheckIn = () => {
    router.push("/checkin/step1");
  };

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
      setError(error instanceof Error ? error.message : "Failed to load check-ins");
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
      case 'overjoyed':
      case 'happy':
        return 'happy';
      case 'neutral':
        return 'remove';
      case 'sad':
        return 'sad';
      case 'depressed':
        return 'cloud';
      case 'angry':
        return 'flash';
      case 'anxious':
        return 'alert-circle';
      case 'calm':
        return 'leaf';
      default:
        return 'ellipse';
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood.toLowerCase()) {
      case 'overjoyed':
      case 'happy':
        return theme.colors.mood?.happy || theme.colors.primary;
      case 'neutral':
        return theme.colors.textSecondary;
      case 'sad':
        return theme.colors.mood?.sad || '#6B7280';
      case 'depressed':
        return theme.colors.mood?.depressed || '#4B5563';
      case 'angry':
        return theme.colors.mood?.angry || '#EF4444';
      case 'anxious':
        return theme.colors.mood?.anxious || '#F59E0B';
      case 'calm':
        return theme.colors.mood?.calm || '#10B981';
      default:
        return theme.colors.textSecondary;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const getStreakCount = () => {
    // Simple streak calculation - could be enhanced
    let streak = 0;
    const today = new Date();
    const sortedCheckIns = checkIns
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    for (const checkIn of sortedCheckIns) {
      const checkInDate = new Date(checkIn.createdAt);
      const daysDiff = Math.floor((today.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      
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
    
    return checkIns.filter(checkIn => {
      const checkInDate = new Date(checkIn.createdAt);
      return checkInDate >= startOfMonth;
    }).length;
  };

  const getLatestMood = () => {
    if (checkIns.length === 0) return { mood: 'neutral', label: 'Ready to check in' };
    
    const latest = checkIns[0];
    return { mood: latest.mood, label: `Feeling ${latest.mood}` };
  };

  if (loading) {
    return (
      <AnimatedPageWrapper animationType="scaleIn">
        <View
          style={[
            styles.container,
            styles.centered,
            {
              backgroundColor: theme.colors.backgroundGreen,
              paddingTop: insets.top,
            },
          ]}
        >
          <LoadingAnimation />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading your check-ins...
          </Text>
        </View>
      </AnimatedPageWrapper>
    );
  }
  const latestMood = getLatestMood();
  const streakCount = getStreakCount();
  const thisMonthCount = getThisMonthCount();

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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              How are you feeling today?
            </Text>
          </View>

          {/* Main Mood Check-in Card */}
          <View
            style={[styles.moodCard, { backgroundColor: theme.colors.card }]}
          >
            <View style={styles.moodFace}>
              <Ionicons
                name={getMoodIcon(latestMood.mood)}
                size={80}
                color={getMoodColor(latestMood.mood)}
              />
            </View>

            <Text
              style={[styles.moodPrompt, { color: theme.colors.textSecondary }]}
            >
              {latestMood.label}
            </Text>

            <TouchableOpacity
              style={[
                styles.checkInButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={handleStartCheckIn}
              activeOpacity={0.8}
            >
              <Text style={styles.checkInButtonText}>Start Check-in ✓</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View
              style={[styles.statItem, { backgroundColor: theme.colors.card }]}
            >
              <Text style={[styles.statNumber, { color: theme.colors.text }]}>
                {streakCount}
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
                {thisMonthCount}
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
            
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: theme.colors.semantic?.error || '#EF4444' }]}>
                  {error}
                </Text>
                <TouchableOpacity
                  style={[styles.retryButton, { borderColor: theme.colors.border }]}
                  onPress={() => fetchCheckIns()}
                >
                  <Text style={[styles.retryText, { color: theme.colors.primary }]}>
                    Try Again
                  </Text>
                </TouchableOpacity>
              </View>
            ) : checkIns.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="help-circle-outline"
                  size={32}
                  color={theme.colors.textTertiary}
                />
                <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                  No check-ins yet. Start your first check-in above!
                </Text>
              </View>
            ) : (
              <View style={styles.recentList}>
                {checkIns.slice(0, 5).map((checkIn) => (
                  <View key={checkIn.id} style={styles.recentItem}>
                    <Ionicons
                      name={getMoodIcon(checkIn.mood)}
                      size={20}
                      color={getMoodColor(checkIn.mood)}
                    />
                    <View style={styles.recentContent}>
                      <Text
                        style={[styles.recentMood, { color: theme.colors.text }]}
                      >
                        {checkIn.mood.charAt(0).toUpperCase() + checkIn.mood.slice(1)}
                      </Text>
                      <Text
                        style={[
                          styles.recentTime,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        {formatTimeAgo(checkIn.createdAt)}
                      </Text>
                    </View>
                    {checkIn.moodIntensity && (
                      <Text
                        style={[
                          styles.intensityBadge,
                          {
                            color: theme.colors.textSecondary,
                            backgroundColor: theme.colors.surface
                          }
                        ]}
                      >
                        {checkIn.moodIntensity}/10
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 20,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  intensityBadge: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontWeight: '500',
    overflow: 'hidden',
  },
});
