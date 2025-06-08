import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";
import { DiaryEntry } from "@/hooks/useDiary";

interface DiaryEntryCardProps {
  entry: DiaryEntry;
  onPress?: () => void;
  onLongPress?: (id: number) => void;
  onToggleFavorite?: (id: number) => Promise<void>;
}

const { width } = Dimensions.get("window");
const cardWidth = width - 40; // 20px margin on each side

export default function DiaryEntryCard({
  entry,
  onPress,
  onLongPress,
  onToggleFavorite,
}: DiaryEntryCardProps) {
  const handleLongPress = () => {
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress?.(entry.id);
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getMoodIcon = (mood: string | null) => {
    if (!mood) return "heart-outline";

    switch (mood.toLowerCase()) {
      case "peaceful":
      case "calm":
        return "leaf-outline";
      case "contemplative":
      case "reflective":
        return "water-outline";
      case "cozy":
      case "comfortable":
        return "book-outline";
      case "happy":
      case "joyful":
        return "happy-outline";
      case "excited":
        return "flash-outline";
      case "grateful":
        return "heart-outline";
      case "energetic":
        return "flash-outline";
      case "hopeful":
        return "sunny-outline";
      case "inspired":
        return "bulb-outline";
      default:
        return "heart-outline";
    }
  };

  const getReadTime = (content: string) => {
    const words = content.split(" ").length;
    const readTime = Math.max(1, Math.ceil(words / 200)); // Average reading speed
    return `${readTime} min read`;
  };

  const parseEmotions = (emotions: string | null): string[] => {
    if (!emotions) return [];
    try {
      return JSON.parse(emotions);
    } catch {
      return [];
    }
  };
  const emotions = parseEmotions(entry.emotions);
  const moodIcon = getMoodIcon(entry.mood);
  const displayMood = entry.mood || "Reflective";
  const { theme } = useTheme();
  const renderCardContent = () => (
    <>
      {/* Header with mood icon and date */}
      <View style={styles.header}>
        <View style={styles.moodContainer}>
          <View
            style={[
              styles.moodIconContainer,
              {
                backgroundColor: theme.colors.cardSecondary,
              },
            ]}
          >
            <Ionicons
              name={moodIcon as any}
              size={16}
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.dateTimeContainer}>
            <View style={styles.dateTimeRow}>
              <Text
                style={[styles.date, { color: theme.colors.textSecondary }]}
              >
                {formatDate(entry.date)}
              </Text>
              <View
                style={[
                  styles.timeChip,
                  {
                    backgroundColor: theme.colors.backgroundGreen,
                  },
                ]}
              >
                <Text style={[styles.time, { color: theme.colors.primary }]}>
                  {formatTime(entry.createdAt)}
                </Text>
              </View>
            </View>
            <Text style={[styles.mood, { color: theme.colors.textTertiary }]}>
              {displayMood}
              {emotions.length > 0 && ` • ${emotions.slice(0, 2).join(", ")}`}
            </Text>
          </View>
        </View>
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {entry.title || "Untitled Entry"}
      </Text>

      {/* Complete content */}
      <View style={styles.contentContainer}>
        {entry.content.split("\n").map((paragraph, index) => {
          if (!paragraph.trim()) return null;
          return (
            <Text
              key={index}
              style={[styles.content, { color: theme.colors.text }]}
            >
              {paragraph}
            </Text>
          );
        })}
      </View>

      {/* Footer with read time and actions */}
      <View style={styles.footer}>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onToggleFavorite?.(entry.id)}
          >
            <Ionicons
              name={entry.isFavorite ? "heart" : "heart-outline"}
              size={16}
              color={
                entry.isFavorite
                  ? theme.colors.semantic.error
                  : theme.colors.textSecondary
              }
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.readTime, { color: theme.colors.textTertiary }]}>
          {getReadTime(entry.content)}
        </Text>
      </View>
    </>
  );
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onLongPress={handleLongPress}
        delayLongPress={500}
        style={({ pressed }) => [styles.touchable, pressed && styles.pressed]}
      >
        {entry.imageUrl ? (
          <ImageBackground
            source={{ uri: entry.imageUrl }}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            <BlurView
              intensity={theme.isDark ? 60 : 70}
              style={styles.imageBlurOverlay}
              tint={theme.isDark ? "dark" : "light"}
            />
            <View
              style={[
                styles.contentOverlay,
                {
                  backgroundColor: theme.isDark
                    ? "rgba(0, 0, 0, 0.8)"
                    : "rgba(255, 255, 255, 0.75)",
                },
              ]}
            >
              {renderCardContent()}
            </View>
          </ImageBackground>
        ) : (
          <View
            style={[
              styles.plainContent,
              {
                backgroundColor: theme.colors.card,
              },
            ]}
          >
            {renderCardContent()}
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 25,
    marginHorizontal: 0, // Removed horizontal margin to work with parent padding
    marginVertical: 0,
    overflow: "hidden",
    borderWidth: 1,
  },
  touchable: {
    flex: 1,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  backgroundImage: {
    flex: 1,
  },
  imageBlurOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  contentOverlay: {
    padding: 16,
    flex: 1,
  },
  plainContent: {
    padding: 16,
    flex: 1,
  },
  header: {
    marginBottom: 16,
  },
  moodContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  moodIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  dateTimeContainer: {
    flex: 1,
    gap: 6,
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
  },
  date: {
    fontSize: 14,
    fontWeight: "500",
  },
  timeChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  time: {
    fontSize: 12,
    fontWeight: "600",
  },
  mood: {
    fontSize: 12,
    textTransform: "capitalize",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    lineHeight: 28,
  },
  contentContainer: {
    marginBottom: 0,
  },
  content: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: "left",
    marginBottom: 0,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 16,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
  },
  readTime: {
    fontSize: 12,
    fontWeight: "500",
  },
});
