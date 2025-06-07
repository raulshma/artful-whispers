import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Text,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  StatCard,
  BarChart,
  HorizontalBarChart,
  CompactCalendar
} from '@/components/ui';

// Mock data - replace with actual API calls
const mockMoodData = [
  { label: 'Happy', value: 25, color: '#10B981' },
  { label: 'Calm', value: 20, color: '#06B6D4' },
  { label: 'Anxious', value: 15, color: '#F59E0B' },
  { label: 'Sad', value: 10, color: '#EF4444' },
  { label: 'Angry', value: 5, color: '#DC2626' },
];

const mockEmotionData = [
  { label: 'Joy', value: 0.8, percentage: 68, color: '#10B981' },
  { label: 'Content', value: 0.6, percentage: 45, color: '#06B6D4' },
  { label: 'Worry', value: 0.4, percentage: 22, color: '#F59E0B' },
];

const mockCalendarData = [
  { date: '2024-01-15', mood: 'happy', color: '#10B981' },
  { date: '2024-01-16', mood: 'calm', color: '#06B6D4' },
  { date: '2024-01-17', mood: 'anxious', color: '#F59E0B' },
  { date: '2024-01-18', mood: 'happy', color: '#10B981' },
  { date: '2024-01-19', mood: 'sad', color: '#EF4444' },
];

export default function JournalStatsScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calculate available width for charts in stat cards
  const screenWidth = Dimensions.get('window').width;
  const cardPadding = 32; // Total horizontal padding (16 * 2)
  const cardGap = 12; // Gap between cards
  const availableWidth = screenWidth - cardPadding;
  const cardWidth = (availableWidth - cardGap) / 2;
  const chartWidth = Math.max(120, cardWidth - 20); // Ensure minimum width

  const handleRefresh = async () => {
    setRefreshing(true);    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading your stats...
          </Text>
        </View>
      </View>
    );  }  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.content}>
          {/* Greeting Section */}
          <View style={styles.greetingSection}>
            <Text style={[styles.greeting, { color: theme.colors.text }]}>
              Good morning, {user?.name || 'Friend'}!
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Here's how you've been feeling lately
            </Text>
          </View>

          {/* Mood Distribution Chart */}
          <View style={styles.chartSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Mood Distribution
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
              Last 30 days
            </Text>
            <View style={styles.chartContainer}>
              <BarChart
                data={mockMoodData}
                width={350}
                height={200}
                showLabels={true}
                showValues={true}
              />
            </View>
          </View>          {/* Statistics Cards Row */}
          <View style={styles.statsRow}>
            {/* Most Frequent Emotion Card */}
            <View style={styles.statCard}>
              <StatCard
                title="Most frequent emotion"
                value="Joy"
                subtitle="68% of entries"
                trend={{ value: 12, isPositive: true }}
              />              <View style={styles.emotionChart}>
                <HorizontalBarChart
                  data={mockEmotionData}
                  width={chartWidth}
                  height={90}
                />
              </View>
            </View>

            {/* Journals Written Card */}
            <View style={styles.statCard}>
              <StatCard
                title="Journals written"
                value="24"
                subtitle="This month"
                trend={{ value: 8, isPositive: true }}
              />
              <View style={styles.calendarContainer}>
                <CompactCalendar
                  moodEntries={mockCalendarData}
                  style={styles.compactCalendar}
                />
              </View>
            </View>
          </View>

          {/* Additional Stats */}
          <View style={styles.additionalStats}>
            <StatCard
              title="Current streak"
              value="7 days"
              subtitle="Keep it going!"
              icon="flame"
            />
            
            <StatCard
              title="Average mood"
              value="7.2/10"
              subtitle="Above your baseline"
              trend={{ value: 0.5, isPositive: true }}
              icon="heart"
            />
            
            <StatCard
              title="Weekly progress"
              value="85%"
              subtitle="Goal: 5 entries/week"
              trend={{ value: 15, isPositive: true }}
              icon="target"
            />
          </View>

          {/* Insights Section */}
          <View style={styles.insightsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Insights
            </Text>
            <View style={[styles.insightCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.insightText, { color: theme.colors.text }]}>
                💡 You tend to feel happiest on weekends and Wednesdays
              </Text>
            </View>
            <View style={[styles.insightCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.insightText, { color: theme.colors.text }]}>
                📈 Your mood has improved by 15% this month compared to last month
              </Text>
            </View>
            <View style={[styles.insightCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.insightText, { color: theme.colors.text }]}>
                🎯 You're most consistent with journaling in the evening
              </Text>
            </View>
          </View>        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },  content: {
    padding: 16,
    paddingBottom: 100, // Space for tab bar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  greetingSection: {
    marginBottom: 32,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  chartSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    gap: 8,
    minWidth: 0, // Allow flex items to shrink below their content size
  },
  emotionChart: {
    marginTop: 8,
    alignItems: 'center',
    overflow: 'hidden', // Prevent chart from overflowing
  },
  calendarContainer: {
    marginTop: 8,
    alignItems: 'center',
    overflow: 'hidden', // Prevent calendar from overflowing
  },
  compactCalendar: {
    alignSelf: 'center',
    maxWidth: '100%', // Ensure it doesn't exceed container width
  },
  additionalStats: {
    gap: 12,
    marginBottom: 32,
  },
  insightsSection: {
    marginBottom: 16,
  },
  insightCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
