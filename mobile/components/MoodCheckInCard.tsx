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

interface MoodCheckInCardProps {
  title: string;
  subtitle: string;
  moodIcon: string;
  moodColor: string;
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const cardWidth = width - 40;

export default function MoodCheckInCard({ 
  title, 
  subtitle, 
  moodIcon, 
  moodColor, 
  onPress 
}: MoodCheckInCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Ionicons 
          name="heart-outline" 
          size={24} 
          color={theme.colors.textSecondary} 
        />
      </View>

      <View style={styles.content}>
        <View style={styles.moodDisplay}>
          <View style={[styles.moodIconContainer, { backgroundColor: `${moodColor}20` }]}>
            <Ionicons
              name={moodIcon as any}
              size={60}
              color={moodColor}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.checkInButton, { backgroundColor: theme.colors.primary }]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="checkmark-circle-outline" 
            size={20} 
            color="#FFFFFF" 
            style={styles.buttonIcon}
          />
          <Text style={styles.checkInButtonText}>Start Check-in</Text>
        </TouchableOpacity>
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
  content: {
    alignItems: 'center',
  },
  moodDisplay: {
    marginBottom: theme.spacing.xl,
  },
  moodIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    minWidth: 200,
  },
  buttonIcon: {
    marginRight: 8,
  },
  checkInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
