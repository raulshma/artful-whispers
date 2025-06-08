import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

interface CalendarDay {
  day: number;
  mood: "happy" | "neutral" | "sad" | "negative" | "skipped" | null;
  hasEntry: boolean;
}

interface MoodCalendarProps {
  title: string;
  subtitle: string;
  days: CalendarDay[];
  currentMonth: string;
  onDayPress?: (day: number) => void;
  onAddPress?: () => void;
  onPress?: () => void;
}

const { width } = Dimensions.get("window");
const cardWidth = width - 40;

const DAYS_OF_WEEK = ["M", "T", "W", "T", "F", "S", "S"];

export default function MoodCalendar({
  title,
  subtitle,
  days,
  currentMonth,
  onDayPress,
  onAddPress,
  onPress,
}: MoodCalendarProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const getMoodColor = (mood: CalendarDay["mood"]) => {
    if (!mood) return theme.colors.border;

    switch (mood) {
      case "happy":
        return theme.colors.mood.happy;
      case "neutral":
        return theme.colors.mood.neutral;
      case "sad":
        return theme.colors.mood.sad;
      case "negative":
        return theme.colors.mood.negative;
      case "skipped":
        return theme.colors.mood.skipped;
      default:
        return theme.colors.border;
    }
  };

  const getMoodIcon = (mood: CalendarDay["mood"]) => {
    if (!mood) return "ellipse-outline";

    switch (mood) {
      case "happy":
        return "happy";
      case "neutral":
        return "remove";
      case "sad":
        return "sad";
      case "negative":
        return "sad";
      case "skipped":
        return "close";
      default:
        return "ellipse-outline";
    }
  };

  const renderCalendarDay = (day: CalendarDay, index: number) => {
    const moodColor = getMoodColor(day.mood);
    const moodIcon = getMoodIcon(day.mood);

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.calendarDay,
          day.hasEntry && { backgroundColor: moodColor + "20" },
        ]}
        onPress={() => onDayPress?.(day.day)}
        activeOpacity={0.7}
      >
        {day.hasEntry ? (
          <Ionicons name={moodIcon as any} size={20} color={moodColor} />
        ) : (
          <View
            style={[styles.emptyDay, { borderColor: theme.colors.border }]}
          />
        )}
      </TouchableOpacity>
    );
  };
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddPress}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.calendarContainer}>
        {/* Days of week header */}
        <View style={styles.weekHeader}>
          {DAYS_OF_WEEK.map((day, index) => (
            <Text key={index} style={styles.weekDay}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.calendarGrid}>
          {days.map((day, index) => renderCalendarDay(day, index))}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Ionicons name="happy" size={16} color={theme.colors.mood.happy} />
        </View>
        <View style={styles.legendItem}>
          <Ionicons name="remove" size={16} color={theme.colors.mood.neutral} />
        </View>
        <View style={styles.legendItem}>
          <Ionicons name="sad" size={16} color={theme.colors.mood.sad} />
        </View>
        <View style={styles.legendItem}>
          <Ionicons name="sad" size={16} color={theme.colors.mood.negative} />
        </View>
        <View style={styles.legendItem}>
          <Ionicons name="close" size={16} color={theme.colors.mood.skipped} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.lg,
      marginVertical: theme.spacing.sm,
      marginHorizontal: theme.spacing.md,
      ...theme.shadows.md,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: theme.spacing.lg,
    },
    title: {
      ...theme.typography.h4,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    addButton: {
      width: 32,
      height: 32,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.backgroundSecondary,
      alignItems: "center",
      justifyContent: "center",
    },
    calendarContainer: {
      marginBottom: theme.spacing.md,
    },
    weekHeader: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs,
    },
    weekDay: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      fontWeight: "600",
      textAlign: "center",
      width: 32,
    },
    calendarGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-around",
      gap: theme.spacing.xs,
    },
    calendarDay: {
      width: 32,
      height: 32,
      borderRadius: theme.borderRadius.sm,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.xs,
    },
    emptyDay: {
      width: 20,
      height: 20,
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
    },
    legend: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    legendItem: {
      alignItems: "center",
      justifyContent: "center",
    },
  });
