import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { SkiaLoadingAnimation } from '@/components/ui/SkiaLoadingAnimation';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchJournalSummary } from '@/lib/api';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface JournalStatsData {
  positive: number;
  neutral: number;
  negative: number;
  skipped: number;
  total: number;
}

const { width, height } = Dimensions.get('window');

export default function JournalAdvancedStats() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { period = 'currentMonth' } = useLocalSearchParams<{ period: string }>();
  const styles = createStyles(theme);

  // Fetch journal summary stats
  const {
    data,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["journalStats", period],
    queryFn: () => fetchJournalSummary(period),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const getPeriodDisplayName = (period: string): string => {
    switch (period) {
      case 'currentMonth':
        return 'This Month';
      case 'last30days':
        return 'Last 30 Days';
      case 'last7days':
        return 'Last 7 Days';
      default:
        return 'All Time';
    }
  };

  const getPositivityRate = () => {
    if (!data || data.total === 0) return 0;
    return ((data.positive / data.total) * 100).toFixed(1);
  };

  const getCompletionRate = () => {
    if (!data || data.total === 0) return 0;
    const completed = data.total - data.skipped;
    return ((completed / data.total) * 100).toFixed(1);
  };

  const getAverageEntriesPerDay = () => {
    if (!data) return 0;
    const days = period === 'last7days' ? 7 : period === 'last30days' ? 30 : 30; // Approximate
    return (data.total / days).toFixed(1);
  };

  const renderDetailCard = (
    title: string,
    value: string | number,
    subtitle: string,
    color: string,
    icon: string
  ) => (
    <Animated.View 
      entering={FadeIn.delay(200).duration(400)}
      style={[styles.detailCard, { backgroundColor: color + '20' }]}
    >
      <View style={styles.detailCardHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        <Text style={[styles.detailCardValue, { color }]}>{value}</Text>
      </View>
      <Text style={[styles.detailCardTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.detailCardSubtitle, { color: theme.colors.textSecondary }]}>
        {subtitle}
      </Text>
    </Animated.View>
  );

  const renderMoodBreakdown = () => (
    <Animated.View 
      entering={FadeIn.delay(400).duration(400)}
      style={styles.breakdownContainer}
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Mood Distribution
      </Text>
      
      <View style={styles.moodBars}>
        {[
          { key: 'positive', count: data?.positive || 0, color: theme.colors.mood.happy, label: 'Positive', icon: 'happy-outline' },
          { key: 'neutral', count: data?.neutral || 0, color: theme.colors.mood.neutral, label: 'Neutral', icon: 'remove-outline' },
          { key: 'negative', count: data?.negative || 0, color: theme.colors.mood.sad, label: 'Negative', icon: 'sad-outline' },
          { key: 'skipped', count: data?.skipped || 0, color: theme.colors.textTertiary, label: 'Skipped', icon: 'ellipsis-horizontal-outline' },
        ].map((mood, index) => {
          const percentage = data && data.total > 0 ? (mood.count / data.total) * 100 : 0;
          return (
            <Animated.View 
              key={mood.key}
              entering={FadeIn.delay(500 + index * 100).duration(400)}
              style={styles.moodBarContainer}
            >
              <View style={styles.moodBarHeader}>
                <View style={styles.moodBarInfo}>
                  <Ionicons name={mood.icon as any} size={20} color={mood.color} />
                  <Text style={[styles.moodBarLabel, { color: theme.colors.text }]}>
                    {mood.label}
                  </Text>
                </View>
                <Text style={[styles.moodBarCount, { color: theme.colors.textSecondary }]}>
                  {mood.count} ({percentage.toFixed(1)}%)
                </Text>
              </View>
              <View style={styles.moodBarTrack}>
                <Animated.View 
                  entering={FadeIn.delay(600 + index * 100).duration(600)}
                  style={[
                    styles.moodBarFill,
                    { 
                      backgroundColor: mood.color,
                      width: `${percentage}%`
                    }
                  ]}
                />
              </View>
            </Animated.View>
          );
        })}
      </View>
    </Animated.View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Journal Analytics
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <SkiaLoadingAnimation
            size={120}
            color={theme.colors.primary}
            variant="orbital"
            visible={true}
          />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading analytics...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Journal Analytics
          </Text>
        </View>
        <View style={styles.errorContainer}>
          <SkiaLoadingAnimation
            size={50}
            color={theme.colors.semantic.error}
            variant="ripple"
            visible={true}
          />
          <Text style={[styles.errorText, { color: theme.colors.semantic.error }]}>
            Failed to load analytics
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Journal Analytics
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
          {getPeriodDisplayName(period)}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          {renderDetailCard(
            'Positivity Rate',
            `${getPositivityRate()}%`,
            'Percentage of positive entries',
            theme.colors.mood.happy,
            'trending-up-outline'
          )}
          {renderDetailCard(
            'Completion Rate',
            `${getCompletionRate()}%`,
            'Entries with mood recorded',
            theme.colors.primary,
            'checkmark-circle-outline'
          )}
          {renderDetailCard(
            'Daily Average',
            getAverageEntriesPerDay(),
            'Entries per day',
            theme.colors.mood.neutral,
            'calendar-outline'
          )}
          {renderDetailCard(
            'Total Entries',
            data.total.toString(),
            'Journal entries written',
            theme.colors.accent,
            'document-text-outline'
          )}
        </View>

        {/* Mood Breakdown */}
        {renderMoodBreakdown()}

        {/* Insights */}
        <Animated.View 
          entering={FadeIn.delay(800).duration(400)}
          style={styles.insightsContainer}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Insights
          </Text>
          <View style={styles.insightCard}>
            <Ionicons name="bulb-outline" size={20} color={theme.colors.primary} />
            <Text style={[styles.insightText, { color: theme.colors.textSecondary }]}>
              {data.positive > data.negative 
                ? `You're maintaining a positive outlook! ${data.positive} positive entries vs ${data.negative} negative ones.`
                : data.positive === data.negative
                ? `Your mood entries are balanced between positive and negative.`
                : `Consider focusing on positive aspects in your journaling to improve your overall mood tracking.`
              }
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.cardBackground,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  detailCard: {
    width: (width - 60) / 2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  detailCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  detailCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  detailCardSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  breakdownContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  moodBars: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    padding: 16,
  },
  moodBarContainer: {
    marginBottom: 16,
  },
  moodBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodBarInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodBarLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  moodBarCount: {
    fontSize: 14,
  },
  moodBarTrack: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  moodBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  insightsContainer: {
    marginBottom: 30,
  },
  insightCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
  },
});
