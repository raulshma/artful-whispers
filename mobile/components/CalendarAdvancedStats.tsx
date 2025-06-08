import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { SkiaLoadingAnimation } from "@/components/ui/SkiaLoadingAnimation";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface CalendarDay {
  day: number;
  mood: "happy" | "neutral" | "sad" | "negative" | "skipped" | null;
  hasEntry: boolean;
}

interface CalendarAdvancedStatsProps {
  visible: boolean;
  onClose: () => void;
  days: CalendarDay[];
  currentMonth: string;
  onDayPress?: (day: number) => void;
}

const { width, height } = Dimensions.get("window");

export default function CalendarAdvancedStats({
  visible,
  onClose,
  days,
  currentMonth,
  onDayPress,
}: CalendarAdvancedStatsProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const getEntriesWithMood = () => {
    return days.filter((day) => day.hasEntry && day.mood).length;
  };

  const getTotalEntries = () => {
    return days.filter((day) => day.hasEntry).length;
  };

  const getCompletionRate = () => {
    const totalDays = days.length;
    const completedDays = getTotalEntries();
    return totalDays > 0 ? ((completedDays / totalDays) * 100).toFixed(1) : "0";
  };

  const getMoodDistribution = () => {
    const distribution: { [key: string]: number } = {};
    days.forEach((day) => {
      if (day.hasEntry && day.mood) {
        distribution[day.mood] = (distribution[day.mood] || 0) + 1;
      }
    });
    return distribution;
  };

  const getLongestStreak = () => {
    let currentStreak = 0;
    let longestStreak = 0;

    days.forEach((day) => {
      if (day.hasEntry) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    return longestStreak;
  };

  const getCurrentStreak = () => {
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].hasEntry) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const getMoodColor = (mood: CalendarDay["mood"]) => {
    if (!mood) return theme.colors.border;

    switch (mood) {
      case "happy":
        return theme.colors.mood.happy;
      case "neutral":
        return theme.colors.mood.neutral;
      case "sad":
      case "negative":
        return theme.colors.mood.sad;
      case "skipped":
        return theme.colors.textTertiary;
      default:
        return theme.colors.border;
    }
  };
  const getMoodIcon = (mood: CalendarDay["mood"]) => {
    switch (mood) {
      case "happy":
        return "happy-outline";
      case "neutral":
        return "remove-outline";
      case "sad":
      case "negative":
        return "sad-outline";
      case "skipped":
        return "ellipsis-horizontal-outline";
      default:
        return "ellipse-outline";
    }
  };

  const renderDetailCard = (
    title: string,
    value: string | number,
    subtitle: string,
    color: string,
    icon: string
  ) => (
    <Animated.View
      entering={FadeIn.delay(200).duration(400)}
      style={[styles.detailCard, { backgroundColor: color + "20" }]}
    >
      <View style={styles.detailCardHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={[styles.detailCardValue, { color }]}>{value}</Text>
      </View>
      <Text style={[styles.detailCardTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
      <Text
        style={[
          styles.detailCardSubtitle,
          { color: theme.colors.textSecondary },
        ]}
      >
        {subtitle}
      </Text>
    </Animated.View>
  );

  const renderCalendarGrid = () => {
    const DAYS_OF_WEEK = ["M", "T", "W", "T", "F", "S", "S"];

    return (
      <Animated.View
        entering={FadeIn.delay(400).duration(400)}
        style={styles.calendarContainer}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Monthly View
        </Text>
        <View style={styles.calendarCard}>
          {/* Days of week header */}
          <View style={styles.weekHeader}>
            {DAYS_OF_WEEK.map((day, index) => (
              <Text
                key={index}
                style={[styles.weekDay, { color: theme.colors.textSecondary }]}
              >
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.calendarGrid}>
            {days.map((day, index) => (
              <TouchableOpacity
                key={day.day}
                style={[
                  styles.calendarDay,
                  day.hasEntry && styles.calendarDayWithEntry,
                  {
                    backgroundColor: day.hasEntry
                      ? getMoodColor(day.mood) + "30"
                      : "transparent",
                  },
                ]}
                onPress={() => onDayPress?.(day.day)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.calendarDayText,
                    {
                      color: day.hasEntry
                        ? getMoodColor(day.mood)
                        : theme.colors.textTertiary,
                    },
                  ]}
                >
                  {day.day}
                </Text>
                {day.hasEntry && (
                  <View
                    style={[
                      styles.calendarDayDot,
                      { backgroundColor: getMoodColor(day.mood) },
                    ]}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderMoodDistribution = () => {
    const distribution = getMoodDistribution();
    const totalWithMood = Object.values(distribution).reduce(
      (sum, count) => sum + count,
      0
    );

    if (totalWithMood === 0) return null;

    return (
      <Animated.View
        entering={FadeIn.delay(600).duration(400)}
        style={styles.distributionContainer}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Mood Distribution
        </Text>
        <View style={styles.distributionCard}>
          {Object.entries(distribution).map(([mood, count], index) => {
            const percentage = (count / totalWithMood) * 100;
            return (
              <Animated.View
                key={mood}
                entering={FadeIn.delay(700 + index * 100).duration(400)}
                style={styles.moodDistributionItem}
              >
                <View style={styles.moodDistributionHeader}>
                  <View style={styles.moodDistributionInfo}>
                    <Ionicons
                      name={getMoodIcon(mood as CalendarDay["mood"]) as any}
                      size={20}
                      color={getMoodColor(mood as CalendarDay["mood"])}
                    />
                    <Text
                      style={[
                        styles.moodDistributionName,
                        { color: theme.colors.text },
                      ]}
                    >
                      {mood.charAt(0).toUpperCase() + mood.slice(1)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.moodDistributionCount,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {count} ({percentage.toFixed(1)}%)
                  </Text>
                </View>
                <View style={styles.moodDistributionBar}>
                  <View
                    style={[
                      styles.moodDistributionFill,
                      {
                        backgroundColor: getMoodColor(
                          mood as CalendarDay["mood"]
                        ),
                        width: `${percentage}%`,
                      },
                    ]}
                  />
                </View>
              </Animated.View>
            );
          })}
        </View>
      </Animated.View>
    );
  };

  const renderInsights = () => {
    const completionRate = parseFloat(getCompletionRate());
    const currentStreak = getCurrentStreak();
    const longestStreak = getLongestStreak();

    let insightText = "";
    if (completionRate === 0) {
      insightText =
        "Start journaling this month to track your progress and build a healthy habit!";
    } else if (completionRate < 30) {
      insightText = `You've journaled ${completionRate.toFixed(
        1
      )}% of this month. Try to write a little each day to build consistency.`;
    } else if (completionRate < 70) {
      insightText = `Good progress! You've completed ${completionRate.toFixed(
        1
      )}% of this month. Keep up the momentum.`;
    } else {
      insightText = `Excellent consistency! You've journaled ${completionRate.toFixed(
        1
      )}% of this month. Your dedication is paying off.`;
    }

    return (
      <Animated.View
        entering={FadeIn.delay(800).duration(400)}
        style={styles.insightsContainer}
      >
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Insights
        </Text>
        <View style={styles.insightCard}>
          <Ionicons
            name="bulb-outline"
            size={20}
            color={theme.colors.primary}
          />
          <Text
            style={[styles.insightText, { color: theme.colors.textSecondary }]}
          >
            {insightText}
          </Text>
        </View>
        {currentStreak > 0 && (
          <View style={[styles.insightCard, { marginTop: 12 }]}>
            <Ionicons
              name="flame-outline"
              size={20}
              color={theme.colors.semantic.warning}
            />
            <Text
              style={[
                styles.insightText,
                { color: theme.colors.textSecondary },
              ]}
            >
              You're on a {currentStreak}-day streak! Your longest streak this
              month is {longestStreak} days.
            </Text>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Calendar Analytics
          </Text>
          <Text
            style={[
              styles.headerSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            {currentMonth}
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Summary Cards */}
          <View style={styles.summaryGrid}>
            {renderDetailCard(
              "Completion Rate",
              `${getCompletionRate()}%`,
              "Days with entries",
              theme.colors.primary,
              "checkmark-circle-outline"
            )}
            {renderDetailCard(
              "Total Entries",
              getTotalEntries().toString(),
              "Journal entries written",
              theme.colors.accent,
              "document-text-outline"
            )}
            {renderDetailCard(
              "Current Streak",
              `${getCurrentStreak()}`,
              "Consecutive days",
              theme.colors.semantic.warning,
              "flame-outline"
            )}
            {renderDetailCard(
              "Longest Streak",
              `${getLongestStreak()}`,
              "Best streak this month",
              theme.colors.semantic.success,
              "trophy-outline"
            )}
          </View>

          {/* Calendar Grid */}
          {renderCalendarGrid()}

          {/* Mood Distribution */}
          {renderMoodDistribution()}

          {/* Insights */}
          {renderInsights()}
        </ScrollView>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      padding: 20,
      paddingTop: 60,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      alignItems: "center",
    },
    closeButton: {
      position: "absolute",
      top: 60,
      right: 20,
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.cardBackground,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 16,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    summaryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 30,
    },
    detailCard: {
      width: (width - 60) / 2,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      alignItems: "center",
    },
    detailCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    detailCardValue: {
      fontSize: 20,
      fontWeight: "bold",
      marginLeft: 8,
    },
    detailCardTitle: {
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
      marginBottom: 2,
    },
    detailCardSubtitle: {
      fontSize: 12,
      textAlign: "center",
    },
    calendarContainer: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 16,
    },
    calendarCard: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 12,
      padding: 16,
    },
    weekHeader: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 12,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    weekDay: {
      fontSize: 12,
      fontWeight: "600",
      textAlign: "center",
      width: 32,
    },
    calendarGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-around",
    },
    calendarDay: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
      borderRadius: 16,
      position: "relative",
    },
    calendarDayWithEntry: {
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    calendarDayText: {
      fontSize: 12,
      fontWeight: "500",
    },
    calendarDayDot: {
      position: "absolute",
      bottom: 2,
      width: 4,
      height: 4,
      borderRadius: 2,
    },
    distributionContainer: {
      marginBottom: 30,
    },
    distributionCard: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 12,
      padding: 16,
    },
    moodDistributionItem: {
      marginBottom: 16,
    },
    moodDistributionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    moodDistributionInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    moodDistributionName: {
      fontSize: 14,
      fontWeight: "500",
      marginLeft: 8,
    },
    moodDistributionCount: {
      fontSize: 14,
    },
    moodDistributionBar: {
      height: 6,
      backgroundColor: theme.colors.border,
      borderRadius: 3,
      overflow: "hidden",
    },
    moodDistributionFill: {
      height: "100%",
      borderRadius: 3,
    },
    insightsContainer: {
      marginBottom: 30,
    },
    insightCard: {
      flexDirection: "row",
      padding: 16,
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 12,
      alignItems: "flex-start",
    },
    insightText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
      marginLeft: 12,
    },
  });
