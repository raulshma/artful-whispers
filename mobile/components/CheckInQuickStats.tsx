import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface QuickStat {
  value: number;
  label: string;
  icon: string;
  color: string;
}

interface CheckInQuickStatsProps {
  title: string;
  subtitle: string;
  stats: QuickStat[];
  onPress?: () => void;
}

const { width } = Dimensions.get('window');
const cardWidth = width - 40;

export default function CheckInQuickStats({ 
  title, 
  subtitle, 
  stats, 
  onPress 
}: CheckInQuickStatsProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const renderStat = (stat: QuickStat, index: number) => (
    <View key={index} style={styles.statItem}>
      <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}20` }]}>
        <Ionicons 
          name={stat.icon as any} 
          size={24} 
          color={stat.color} 
        />
      </View>
      <Text style={styles.statValue}>{stat.value}</Text>
      <Text style={styles.statLabel}>{stat.label}</Text>
    </View>
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
          name="stats-chart-outline" 
          size={24} 
          color={theme.colors.textSecondary} 
        />
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => renderStat(stat, index))}
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
