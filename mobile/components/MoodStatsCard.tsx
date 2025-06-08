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

interface MoodStat {
  mood: string;
  count: number;
  color: string;
  icon: string;
  percentage: number;
}

interface MoodStatsCardProps {
  title: string;
  subtitle?: string;
  stats: MoodStat[];
  onPress?: () => void;
}

const { width } = Dimensions.get("window");
const cardWidth = width - 40;

export default function MoodStatsCard({
  title,
  subtitle,
  stats,
  onPress,
}: MoodStatsCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const maxCount = Math.max(...stats.map((stat) => stat.count));

  const renderMoodBar = (stat: MoodStat, index: number) => {
    const barWidth = maxCount > 0 ? (stat.count / maxCount) * 200 : 0;

    return (
      <View key={index} style={styles.moodBarContainer}>
        <View style={styles.moodBarHeader}>
          <Text style={styles.moodCount}>{stat.count}</Text>
          <View style={styles.moodBarTrack}>
            <View
              style={[
                styles.moodBarFill,
                {
                  width: barWidth,
                  backgroundColor: stat.color,
                },
              ]}
            />
          </View>
          <Ionicons
            name={stat.icon as any}
            size={20}
            color={stat.color}
            style={styles.moodIcon}
          />
        </View>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <Ionicons
          name="print-outline"
          size={24}
          color={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.statsContainer}>
        {stats.map((stat, index) => renderMoodBar(stat, index))}
      </View>

      {stats.length > 0 && (
        <Text style={styles.encouragementText}>
          You&apos;ve been reflecting on positive experiences often this month.
          Keep it up!
        </Text>
      )}
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
      ...theme.shadows.md
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: theme.spacing.lg,
    },
    title: {
      ...theme.typography.h3,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    statsContainer: {
      marginBottom: theme.spacing.lg,
    },
    moodBarContainer: {
      marginBottom: theme.spacing.md,
    },
    moodBarHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    moodCount: {
      ...theme.typography.bodyMedium,
      color: theme.colors.text,
      fontWeight: theme.typography.bodyMedium.fontWeight,
      minWidth: 20,
    },
    moodBarTrack: {
      flex: 1,
      height: 8,
      backgroundColor: theme.colors.borderSecondary,
      borderRadius: theme.borderRadius.sm,
      overflow: "hidden",
    },
    moodBarFill: {
      height: "100%",
      borderRadius: theme.borderRadius.sm,
    },
    moodIcon: {
      marginLeft: theme.spacing.xs,
    },
    encouragementText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      textAlign: "left",
      fontStyle: "italic",
    },
  });
