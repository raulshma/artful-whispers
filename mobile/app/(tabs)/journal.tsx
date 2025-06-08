import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  RefreshControl,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useInfiniteDiaryEntries, useFavoriteToggle } from "@/hooks/useDiary";
import { useTheme } from "@/contexts/ThemeContext";
import DiaryEntryCard from "@/components/DiaryEntryCard";
import FloatingComposeButton from "@/components/FloatingComposeButton";
import { useFocusEffect } from "@react-navigation/native";
import { SkiaLoadingAnimation } from "@/components/ui";
import { Spacing } from "@/constants/Spacing";

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
    }    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  const handleToggleFavorite = useCallback(async (entryId: number) => {
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
  }, [favoriteToggle]);

  const handleLongPress = useCallback((entryId: number) => {
    handleToggleFavorite(entryId);
  }, [handleToggleFavorite]);  const renderEntry = ({ item }: { item: any }) => (
    <DiaryEntryCard
      entry={item}
      onPress={() => {
        router.push({
          pathname: "entryDetails" as any,
          params: { entry: JSON.stringify(item) },
        });
      }}
      onLongPress={handleLongPress}
      onToggleFavorite={handleToggleFavorite}
    />
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingFooter}>
        <SkiaLoadingAnimation
          variant="breathing"
          size={40}
          color={theme.colors.primary}
          visible={true}
        />
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="book-outline" size={48} color={theme.colors.primary} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No entries yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        Tap the + button to start writing
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
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
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            Unable to load entries
          </Text>
          <Text style={[styles.errorSubtitle, { color: theme.colors.textSecondary }]}>
            {error?.message || "Something went wrong. Please try again."}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContainer,
          { paddingTop: insets.top + Spacing.md }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
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
    paddingHorizontal: Spacing.md,
    paddingBottom: 100, // Space for floating button
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing["4xl"],
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingFooter: {
    padding: Spacing.lg,
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  errorSubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
