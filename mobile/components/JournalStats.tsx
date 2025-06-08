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

interface JournalStatsData {
  positive: number;
  neutral: number;
  negative: number;
  skipped: number;
  total: number;
}

interface JournalStatsProps {
  title: string;
  subtitle: string;
  data: JournalStatsData;
  onPress?: () => void;
}

const { width } = Dimensions.get("window");
const cardWidth = width - 40;

export default function JournalStats({
  title,
  subtitle,
  data,
  onPress,
}: JournalStatsProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const renderStatBar = (
    count: number,
    color: string,
    icon: string,
    label: string,
    isMain: boolean = false
  ) => {
    return (
      <TouchableOpacity
        style={[
          styles.statBar,
          { backgroundColor: color },
          isMain && styles.mainStatBar,
        ]}
        activeOpacity={0.8}
      >
        <View style={styles.statContent}>
          <Text style={[styles.statNumber, isMain && styles.mainStatNumber]}>
            {count}
          </Text>
          <Text style={[styles.statLabel, isMain && styles.mainStatLabel]}>
            {label}
          </Text>
        </View>
        <View style={styles.statIconContainer}>
          <Ionicons
            name={icon as any}
            size={isMain ? 32 : 24}
            color={isMain ? "#FFFFFF" : "#FFFFFF"}
          />
        </View>
      </TouchableOpacity>
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
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Ionicons
          name="print-outline"
          size={24}
          color={theme.colors.textSecondary}
        />
      </View>

      <View style={styles.statsGrid}>
        {/* Main positive stat - takes up more space */}
        <View style={styles.mainStatContainer}>
          {renderStatBar(
            data.positive,
            theme.colors.mood.positive,
            "happy-outline",
            "Positive",
            true
          )}
        </View>

        {/* Secondary stats in a row */}
        <View style={styles.secondaryStatsRow}>
          <View style={styles.secondaryStatContainer}>
            {renderStatBar(
              data.neutral,
              theme.colors.mood.neutral,
              "remove-outline",
              "Neutral"
            )}
          </View>
          <View style={styles.secondaryStatContainer}>
            {renderStatBar(
              data.negative,
              theme.colors.mood.negative,
              "sad-outline",
              "Negative"
            )}
          </View>
        </View>

        {/* Skipped stat */}
        <View style={styles.skippedStatContainer}>
          {renderStatBar(
            data.skipped,
            theme.colors.mood.skipped,
            "close-outline",
            "Skipped"
          )}
        </View>
      </View>

      {/* Mood emoji indicators at bottom */}
      <View style={styles.moodIndicators}>
        <Ionicons name="close" size={16} color={theme.colors.mood.skipped} />
        <Ionicons name="sad" size={16} color={theme.colors.mood.negative} />
        <Ionicons name="remove" size={16} color={theme.colors.mood.neutral} />
        <Ionicons name="happy" size={16} color={theme.colors.mood.positive} />
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
      ...theme.typography.h3,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    statsGrid: {
      marginBottom: theme.spacing.md,
    },
    mainStatContainer: {
      marginBottom: theme.spacing.md,
    },
    secondaryStatsRow: {
      flexDirection: "row",
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    secondaryStatContainer: {
      flex: 1,
    },
    skippedStatContainer: {
      // Takes full width like main stat
    },
    statBar: {
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 60,
    },
    mainStatBar: {
      minHeight: 80,
      padding: theme.spacing.lg,
    },
    statContent: {
      flex: 1,
    },
    statNumber: {
      ...theme.typography.h4,
      color: "#FFFFFF",
      fontWeight: "bold",
    },
    mainStatNumber: {
      ...theme.typography.h2,
    },
    statLabel: {
      ...theme.typography.bodySmall,
      color: "#FFFFFF",
      opacity: 0.9,
    },
    mainStatLabel: {
      ...theme.typography.body,
    },
    statIconContainer: {
      marginLeft: theme.spacing.sm,
    },
    moodIndicators: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
  });
