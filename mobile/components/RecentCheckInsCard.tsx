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
import { format, isToday, isYesterday } from "date-fns";
import { CheckInResponse } from "@/services/checkinService";
import { SkiaLoadingAnimation } from "@/components/ui/SkiaLoadingAnimation";

interface RecentCheckInsCardProps {
  title: string;
  subtitle: string;
  checkIns: CheckInResponse[];
  onPress?: () => void;
  onItemPress?: (checkIn: CheckInResponse) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const { width } = Dimensions.get("window");
const cardWidth = width - 40;

export default function RecentCheckInsCard({
  title,
  subtitle,
  checkIns,
  onPress,
  onItemPress,
  loading = false,
  error = null,
  onRetry,
}: RecentCheckInsCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, "h:mm a");
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MMM d");
    }
  };
  const renderCheckInItem = (checkIn: CheckInResponse, index: number) => (
    <TouchableOpacity
      key={String(checkIn.id)}
      style={styles.checkInItem}
      onPress={() => onItemPress?.(checkIn)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.moodIconContainer,
          { backgroundColor: `${getMoodColor(checkIn.mood)}20` },
        ]}
      >
        <Ionicons
          name={getMoodIcon(checkIn.mood) as any}
          size={20}
          color={getMoodColor(checkIn.mood)}
        />
      </View>
      <View style={styles.checkInContent}>
        <Text style={styles.moodText}>
          {checkIn.mood.charAt(0).toUpperCase() + checkIn.mood.slice(1)}
        </Text>
        <Text style={styles.timeText}>{formatTimeAgo(checkIn.createdAt)}</Text>
      </View>
      {checkIn.moodIntensity && (
        <View style={styles.intensityBadge}>
          <Text style={styles.intensityText}>{checkIn.moodIntensity}/10</Text>
        </View>
      )}
      <Ionicons
        name="chevron-forward"
        size={16}
        color={theme.colors.textTertiary}
      />
    </TouchableOpacity>
  );

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Ionicons
          name="time-outline"
          size={24}
          color={theme.colors.textSecondary}
        />
      </View>
      {loading && (
        <View style={styles.loadingContainer}>
          <SkiaLoadingAnimation
            size={60}
            color={theme.colors.primary}
            variant="breathing"
            visible={true}
          />
          <Text style={styles.loadingText}>Loading check-ins...</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          {onRetry && (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={onRetry}
              activeOpacity={0.7}
            >
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      {!loading && !error && checkIns.length === 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="help-circle-outline"
            size={32}
            color={theme.colors.textTertiary}
          />
          <Text style={styles.emptyText}>
            No check-ins yet. Start your first check-in above!
          </Text>
        </View>
      )}
      {!loading && !error && checkIns.length > 0 && (
        <View style={styles.checkInsList}>
          {checkIns
            .slice(0, 5)
            .map((checkIn, index) => renderCheckInItem(checkIn, index))}
        </View>
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
      ...theme.shadows.md,
      width: cardWidth,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    checkInsList: {
      gap: 12,
    },
    checkInItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
    },
    moodIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    checkInContent: {
      flex: 1,
    },
    moodText: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.text,
      marginBottom: 2,
    },
    timeText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    intensityBadge: {
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
      marginRight: 8,
    },
    intensityText: {
      fontSize: 12,
      fontWeight: "500",
      color: theme.colors.textSecondary,
    },
    loadingContainer: {
      alignItems: "center",
      paddingVertical: 20,
    },
    loadingText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    errorContainer: {
      alignItems: "center",
      paddingVertical: 20,
    },
    errorText: {
      fontSize: 16,
      textAlign: "center",
      color: theme.colors.semantic?.error || "#EF4444",
      marginBottom: 12,
    },
    retryButton: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 20,
    },
    retryText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.primary,
    },
    emptyContainer: {
      alignItems: "center",
      paddingVertical: 20,
    },
    emptyText: {
      fontSize: 16,
      textAlign: "center",
      color: theme.colors.textSecondary,
      marginTop: 8,
    },
  });
