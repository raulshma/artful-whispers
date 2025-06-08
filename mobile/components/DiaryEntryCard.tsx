import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/contexts/ThemeContext";
import { DiaryEntry } from "@/hooks/useDiary";
import { Spacing } from "@/constants/Spacing";

interface DiaryEntryCardProps {
  entry: DiaryEntry;
  onPress?: () => void;
  onLongPress?: (id: number) => void;
  onToggleFavorite?: (id: number) => Promise<void>;
}

export default function DiaryEntryCard({
  entry,
  onPress,
  onLongPress,
  onToggleFavorite,
}: DiaryEntryCardProps) {
  const { theme } = useTheme();

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLongPress?.(entry.id);
  };

  const handleFavoritePress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await onToggleFavorite?.(entry.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "long" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };
  const getContentPreview = (content: string) => {
    // Clean the content and create a more elegant preview
    const plainText = content
      .replace(/\n\s*\n/g, '\n') // Normalize line breaks
      .replace(/\n/g, " ") // Convert to single line
      .replace(/\s+/g, " ") // Normalize spaces
      .trim();
    
    if (plainText.length <= 160) return plainText;
    
    // Smart truncation that respects sentence boundaries
    const truncated = plainText.substring(0, 160);
    const lastSpace = truncated.lastIndexOf(' ');
    const lastPunctuation = Math.max(
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('!'),
      truncated.lastIndexOf('?'),
      truncated.lastIndexOf(';')
    );
    
    // Prefer sentence endings, then word boundaries
    if (lastPunctuation > 140) {
      return truncated.substring(0, lastPunctuation + 1);
    } else if (lastSpace > 140) {
      return truncated.substring(0, lastSpace) + "…";
    } else {
      return truncated + "…";
    }
  };

  const getReadTime = (content: string) => {
    const words = content.split(" ").length;
    const readTime = Math.max(1, Math.ceil(words / 200));
    return `${readTime} min`;
  };

  return (
    <Pressable      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed 
            ? theme.colors.backgroundSecondary 
            : 'transparent',
          borderColor: pressed 
            ? theme.colors.border 
            : 'transparent',
          shadowColor: pressed ? theme.colors.text : 'transparent',
          shadowOffset: pressed ? { width: 0, height: 1 } : { width: 0, height: 0 },
          shadowOpacity: pressed ? 0.05 : 0,
          shadowRadius: pressed ? 2 : 0,
          elevation: pressed ? 1 : 0,
        },
      ]}
      onPress={onPress}
      onLongPress={handleLongPress}
      delayLongPress={600}
      android_ripple={{
        color: theme.colors.backgroundSecondary,
        borderless: false,
        radius: 200,
      }}
    >
      {/* Header with date and favorite */}
      <View style={styles.header}>
        <View style={styles.dateContainer}>
          <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
            {formatDate(entry.date)}
          </Text>
          <View style={styles.timeDivider} />
          <Text style={[styles.time, { color: theme.colors.textTertiary }]}>
            {formatTime(entry.createdAt)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons
            name={entry.isFavorite ? "heart" : "heart-outline"}
            size={20}
            color={
              entry.isFavorite
                ? theme.colors.semantic.error
                : theme.colors.textTertiary
            }
          />
        </TouchableOpacity>
      </View>      {/* Title */}
      {entry.title && entry.title.trim() && (
        <Text
          style={[styles.title, { color: theme.colors.text }]}
          numberOfLines={2}
        >
          {entry.title.trim()}
        </Text>
      )}

      {/* Content Preview */}
      <Text
        style={[
          entry.title && entry.title.trim() ? styles.content : styles.contentNoTitle, 
          { color: theme.colors.textSecondary }
        ]}
        numberOfLines={entry.title && entry.title.trim() ? 3 : 4}
      >
        {getContentPreview(entry.content)}
      </Text>

      {/* Footer */}
      <View style={styles.footer}>
        {entry.mood && (
          <View style={styles.moodContainer}>
            <View
              style={[
                styles.moodIndicator,
                { backgroundColor: theme.colors.primary },
              ]}
            />
            <Text
              style={[styles.moodText, { color: theme.colors.textTertiary }]}
            >
              {entry.mood}
            </Text>
          </View>
        )}
        <Text style={[styles.readTime, { color: theme.colors.textTertiary }]}>
          {getReadTime(entry.content)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    marginVertical: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  timeDivider: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#CBD5E0',
    marginHorizontal: Spacing.sm,
    opacity: 0.5,
  },
  time: {
    fontSize: 13,
    fontWeight: '400',
    opacity: 0.7,
  },
  favoriteButton: {
    padding: Spacing.sm,
    borderRadius: 24,
    marginLeft: Spacing.sm,
  },
  // Content Styles
  title: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: Spacing.sm,
    letterSpacing: -0.4,
  },
  content: {
    fontSize: 16,
    lineHeight: 25,
    fontWeight: '400',
    marginBottom: Spacing.lg,
    letterSpacing: -0.2,
    opacity: 0.85,
  },
  contentNoTitle: {
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '400',
    marginBottom: Spacing.lg,
    letterSpacing: -0.2,
    opacity: 0.9,
  },

  // Footer Styles
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  moodIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: Spacing.sm,
    opacity: 0.6,
  },
  moodText: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
    letterSpacing: 0.2,
    opacity: 0.7,
  },
  readTime: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.6,
    letterSpacing: 0.3,
  },
});
