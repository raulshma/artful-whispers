import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  RefreshControl,
  Alert,
  Modal,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useInfiniteDiaryEntries } from '@/hooks/useDiary';
import { useTheme } from '@/contexts/ThemeContext';
import DiaryEntryCard from '@/components/DiaryEntryCard';
import FloatingComposeButton from '@/components/FloatingComposeButton';
import NewEntryForm from '@/components/NewEntryForm';
import { useFocusEffect } from '@react-navigation/native';
import { 
  Header,
  HeaderIconButton,
  Card
} from '@/components/ui';

export default function JournalScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  // Memoized date calculations
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  
  // Memoized today's entries
  const todayEntries = useMemo(() => 
    entries.filter(entry => entry.date === today), 
    [entries, today]
  );

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

  const handleNewEntrySuccess = useCallback(() => {
    setShowNewEntry(false);
    refetch();
  }, [refetch]);

  const renderEntry = ({ item }: { item: any }) => (
    <DiaryEntryCard
      entry={item}
      onPress={() => {
        // TODO: Navigate to entry detail
        Alert.alert('Entry', 'Entry detail view coming soon!');
      }}
    />
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading more entries...
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Card style={styles.emptyStateCard}>
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
          Welcome to Your Digital Journal
        </Text>
        <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
          Capture your thoughts, moments, and reflections throughout the day.
          There's no limit - write as many entries as your heart desires.
        </Text>
        <Text style={[styles.emptyHint, { color: theme.colors.textTertiary }]}>
          Tap the + button below to start your first reflection
        </Text>
      </Card>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Journal" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading your entries...
          </Text>
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Journal" />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: theme.colors.text }]}>
            Unable to load entries
          </Text>
          <Text style={[styles.errorSubtitle, { color: theme.colors.textSecondary }]}>
            {error?.message || 'Something went wrong. Please try again.'}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]} 
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title="Journal"
        rightComponent={
          <HeaderIconButton
            iconName="plus"
            onPress={() => setShowNewEntry(true)}
          />
        }
      />

      {/* Today's entry count */}
      {todayEntries.length > 0 && (
        <View style={styles.todayContainer}>
          <Card style={styles.todayChip}>
            <Text style={[styles.todayText, { color: theme.colors.primary }]}>
              {todayEntries.length} reflection{todayEntries.length !== 1 ? 's' : ''} today
            </Text>
            {todayEntries.length > 1 && (
              <Text style={[styles.todaySubtext, { color: theme.colors.textSecondary }]}>
                • Multiple moments captured
              </Text>
            )}
          </Card>
        </View>
      )}

      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={entries.length === 0 ? styles.emptyContainer : styles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      />

      <FloatingComposeButton
        onPress={() => setShowNewEntry(true)}
        hasEntriesToday={todayEntries.length > 0}
      />

      <Modal
        visible={showNewEntry}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={[
          styles.modalContainer,
          { backgroundColor: theme.colors.background }
        ]}>
          <NewEntryForm
            onCancel={() => setShowNewEntry(false)}
            onSuccess={handleNewEntrySuccess}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  todayContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  todayChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  todayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  todaySubtext: {
    fontSize: 12,
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyState: {
    alignItems: 'center',
    gap: 16,
  },
  emptyStateCard: {
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyHint: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingFooter: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
  },
});