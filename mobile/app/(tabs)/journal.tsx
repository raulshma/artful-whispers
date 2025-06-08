import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useInfiniteDiaryEntries, useFavoriteToggle } from "@/hooks/useDiary";
import { useTheme } from "@/contexts/ThemeContext";
import FloatingComposeButton from "@/components/FloatingComposeButton";
import { useFocusEffect } from "@react-navigation/native";
import { SkiaLoadingAnimation } from "@/components/ui";
import { Spacing } from "@/constants/Spacing";
import * as Haptics from "expo-haptics";

export default function JournalScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const favoriteToggle = useFavoriteToggle();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteDiaryEntries(10);

  // Flatten all pages into a single array
  const entries = data?.pages.flat() || [];

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  const handleToggleFavorite = useCallback(
    async (entryId: number) => {
      try {
        const updatedEntry = await favoriteToggle.mutateAsync(entryId);
        // Show feedback based on the new favorite status
        const message = updatedEntry.isFavorite
          ? "Added to favorites ❤️"
          : "Removed from favorites";
        Alert.alert("Success", message);
      } catch (error) {
        Alert.alert("Error", "Failed to update favorite status");
      }
    },
    [favoriteToggle]
  );

  const handleLongPress = useCallback(
    (entryId: number) => {
      handleToggleFavorite(entryId);
    },
    [handleToggleFavorite]
  ); // Minimalist Entry Card Component
  const MinimalEntryCard = ({ item }: { item: any }) => {
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
    const getPreview = (content: string) => {
      const plainText = content
        .replace(/\n\s*\n/g, " • ") // Replace double line breaks with bullet
        .replace(/\n/g, " ") // Replace single line breaks with space
        .trim();

      if (plainText.length <= 140) return plainText;

      // Find a good breaking point near the limit
      const truncated = plainText.substring(0, 140);
      const lastSpace = truncated.lastIndexOf(" ");
      const lastPunctuation = Math.max(
        truncated.lastIndexOf("."),
        truncated.lastIndexOf("!"),
        truncated.lastIndexOf("?")
      );

      if (lastPunctuation > 120) {
        return truncated.substring(0, lastPunctuation + 1);
      } else if (lastSpace > 120) {
        return truncated.substring(0, lastSpace) + "...";
      } else {
        return truncated + "...";
      }
    };

    const handlePress = () => {
      router.push({
        pathname: "entryDetails" as any,
        params: { entry: JSON.stringify(item) },
      });
    };

    const handleFavoritePress = async () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await handleToggleFavorite(item.id);
    };
    return (
      <Pressable
        style={({ pressed }) => [
          styles.entryCard,
          {
            backgroundColor: pressed
              ? theme.colors.backgroundSecondary
              : theme.colors.background,
            borderColor: pressed ? theme.colors.border : "transparent",
          },
          pressed && styles.entryCardPressed,
        ]}
        onPress={handlePress}
        android_ripple={{
          color: theme.colors.backgroundSecondary,
          borderless: false,
        }}
      >
        <View style={styles.entryHeader}>
          <View style={styles.entryMeta}>
            <Text
              style={[styles.entryDate, { color: theme.colors.textSecondary }]}
            >
              {formatDate(item.date)}
            </Text>
            <View style={styles.metaDivider} />
            <Text
              style={[styles.entryTime, { color: theme.colors.textTertiary }]}
            >
              {formatTime(item.createdAt)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={item.isFavorite ? "heart" : "heart-outline"}
              size={18}
              color={
                item.isFavorite
                  ? theme.colors.semantic.error
                  : theme.colors.textTertiary
              }
            />
          </TouchableOpacity>
        </View>

        {item.title && (
          <Text
            style={[styles.entryTitle, { color: theme.colors.text }]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
        )}

        <Text
          style={[styles.entryPreview, { color: theme.colors.textSecondary }]}
          numberOfLines={3}
        >
          {getPreview(item.content)}
        </Text>

        {item.mood && (
          <View style={styles.moodContainer}>
            <View
              style={[
                styles.moodDot,
                { backgroundColor: theme.colors.primary },
              ]}
            />
            <Text
              style={[styles.moodText, { color: theme.colors.textTertiary }]}
            >
              {item.mood}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  const renderEntry = ({ item }: { item: any }) => (
    <MinimalEntryCard item={item} />
  );
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingFooter}>
        <SkiaLoadingAnimation
          variant="breathing"
          size={32}
          color={theme.colors.textTertiary}
          visible={true}
        />
      </View>
    );
  };
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons
          name="book-outline"
          size={64}
          color={theme.colors.textTertiary}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        Your journal awaits
      </Text>
      <Text
        style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}
      >
        Start capturing your thoughts and moments
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <SkiaLoadingAnimation
            variant="ripple"
            size={60}
            color={theme.colors.primary}
            visible={true}
          />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            Unable to load entries
          </Text>
          <Text
            style={[
              styles.errorSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            {error?.message || "Something went wrong. Please try again."}
          </Text>
        </View>
      </View>
    );
  }
  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContainer,
          { paddingTop: insets.top + Spacing.sm },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        bounces={true}
        overScrollMode="auto"
      />
      <FloatingComposeButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: Spacing.xs,
    paddingBottom: 100, // Space for floating button
    paddingTop: Spacing.md,
  },
  // Entry Card Styles - Minimalist Design
  entryCard: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  entryCardPressed: {
    opacity: 0.8,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  entryMeta: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  entryDate: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#CBD5E0",
    marginHorizontal: Spacing.xs,
  },
  entryTime: {
    fontSize: 12,
    fontWeight: "400",
  },
  favoriteButton: {
    padding: Spacing.xs,
    borderRadius: 20,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 26,
    marginBottom: Spacing.sm,
    letterSpacing: -0.3,
  },
  entryPreview: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
    marginBottom: Spacing.md,
    letterSpacing: -0.1,
    opacity: 0.9,
  },
  moodContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
    opacity: 0.8,
  },
  moodDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: Spacing.sm,
    opacity: 0.7,
  },
  moodText: {
    fontSize: 13,
    fontWeight: "500",
    textTransform: "capitalize",
    letterSpacing: 0.1,
  },

  // Empty State Styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing["4xl"],
  },
  emptyIconContainer: {
    marginBottom: Spacing.xl,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    letterSpacing: -0.1,
    opacity: 0.8,
  },

  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingFooter: {
    padding: Spacing.xl,
    alignItems: "center",
  },

  // Error States
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: Spacing.sm,
    letterSpacing: -0.3,
  },
  errorSubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.8,
  },
});
