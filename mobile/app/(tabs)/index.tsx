import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useInfiniteDiaryEntries } from '@/hooks/useDiary';
import { useColorScheme } from '@/hooks/useColorScheme';
import DiaryEntryCard from '@/components/DiaryEntryCard';
import DiaryBackground from '@/components/DiaryBackground';
import FloatingComposeButton from '@/components/FloatingComposeButton';
import NewEntryForm from '@/components/NewEntryForm';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { BlurView } from 'expo-blur';

export default function HomeScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentBgImage, setCurrentBgImage] = useState<string | null>(null);

  // Viewability configuration for background image changes
  const viewabilityConfigRef = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100,
  });

  const onViewableItemsChangedRef = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      // Find the most visible item overall
      let mostVisibleItem = viewableItems[0];
      for (const item of viewableItems) {
        if (item.percentVisible > mostVisibleItem.percentVisible) {
          mostVisibleItem = item;
        }
      }
      
      // Update background image based on the most visible item
      const newImageUrl = mostVisibleItem.item.imageUrl || null;
      
      // Debug logging
      console.log('Most visible item:', {
        date: mostVisibleItem.item.date,
        hasImage: !!mostVisibleItem.item.imageUrl,
        imageUrl: mostVisibleItem.item.imageUrl,
        percentVisible: mostVisibleItem.percentVisible
      });
      
      if (newImageUrl !== currentBgImage) {
        console.log('Updating background from:', currentBgImage, 'to:', newImageUrl);
        setCurrentBgImage(newImageUrl);
      }
    }
  });

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

  // Set initial background image when entries change
  useEffect(() => {
    if (entries.length > 0) {
      // Priority order: today's entries with images -> any entry with image -> fallback to null
      const todayEntriesWithImages = entries.filter(e => e.date === today && e.imageUrl);
      const entriesWithImages = entries.filter(e => e.imageUrl);
      
      const bgImageUrl = todayEntriesWithImages[0]?.imageUrl ||
                       entriesWithImages[0]?.imageUrl ||
                       null;
      setCurrentBgImage(bgImageUrl);
    } else {
      setCurrentBgImage(null);
    }
  }, [entries, today]);

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
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Loading more entries...</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <BlurView
        intensity={isDark ? 20 : 30}
        style={styles.emptyStateBlur}
        tint={isDark ? 'dark' : 'light'}
      >
        <Ionicons 
          name="journal-outline" 
          size={64} 
          color={isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'} 
        />
        <Text style={[
          styles.emptyTitle,
          { color: isDark ? '#ffffff' : '#1f2937' }
        ]}>
          Welcome to Your Digital Journal
        </Text>
        <Text style={[
          styles.emptySubtitle,
          { color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }
        ]}>
          Capture your thoughts, moments, and reflections throughout the day.
          There's no limit - write as many entries as your heart desires.
        </Text>
        <Text style={[
          styles.emptyHint,
          { color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }
        ]}>
          Tap the + button below to start your first reflection
        </Text>
      </BlurView>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#0a0b0d' : '#fffef7' }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <DiaryBackground imageUrl={null} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color={isDark ? '#60a5fa' : '#3b82f6'} 
          />
          <Text style={[
            styles.loadingText,
            { color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }
          ]}>
            Loading your entries...
          </Text>
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#0a0b0d' : '#fffef7' }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <DiaryBackground imageUrl={null} />
        <View style={styles.errorContainer}>
          <Ionicons 
            name="alert-circle-outline" 
            size={48} 
            color={isDark ? '#ef4444' : '#dc2626'} 
          />
          <Text style={[
            styles.errorTitle,
            { color: isDark ? '#ffffff' : '#1f2937' }
          ]}>
            Unable to load entries
          </Text>
          <Text style={[
            styles.errorSubtitle,
            { color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }
          ]}>
            {error?.message || 'Something went wrong. Please try again.'}
          </Text>
          <TouchableOpacity 
            style={[
              styles.retryButton,
              { backgroundColor: isDark ? '#60a5fa' : '#3b82f6' }
            ]} 
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0a0b0d' : '#fffef7' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <DiaryBackground imageUrl={currentBgImage} />
      
      {/* Header with greeting */}
      <BlurView
        intensity={isDark ? 30 : 40}
        style={styles.headerBlur}
        tint={isDark ? 'dark' : 'light'}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <Text style={[
              styles.greeting,
              { color: isDark ? '#ffffff' : '#1f2937' }
            ]}>
              Hello, {user?.name || 'Friend'}!
            </Text>
            <Text style={[
              styles.subtitle,
              { color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }
            ]}>
              {entries.length > 0
                ? `${entries.length} reflection${entries.length !== 1 ? 's' : ''} captured`
                : 'Ready to start journaling?'}
            </Text>
          </View>
        </SafeAreaView>
      </BlurView>

      {/* Today's entry count */}
      {todayEntries.length > 0 && (
        <View style={styles.todayContainer}>
          <BlurView
            intensity={isDark ? 20 : 30}
            style={styles.todayChip}
            tint={isDark ? 'dark' : 'light'}
          >
            <Text style={[
              styles.todayText,
              { color: isDark ? '#60a5fa' : '#3b82f6' }
            ]}>
              {todayEntries.length} reflection{todayEntries.length !== 1 ? 's' : ''} today
            </Text>
            {todayEntries.length > 1 && (
              <Text style={[
                styles.todaySubtext,
                { color: isDark ? 'rgba(96, 165, 250, 0.6)' : 'rgba(59, 130, 246, 0.6)' }
              ]}>
                • Multiple moments captured
              </Text>
            )}
          </BlurView>
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
            colors={[isDark ? '#60a5fa' : '#3b82f6']}
            tintColor={isDark ? '#60a5fa' : '#3b82f6'}
          />
        }
        onViewableItemsChanged={onViewableItemsChangedRef.current}
        viewabilityConfig={viewabilityConfigRef.current}
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
          { backgroundColor: isDark ? '#0a0b0d' : '#fffef7' }
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
  headerBlur: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    gap: 4,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
  },
  todayContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  todayChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
  emptyStateBlur: {
    padding: 32,
    borderRadius: 24,
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
