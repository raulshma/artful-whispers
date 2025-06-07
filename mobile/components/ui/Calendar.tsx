import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

interface MoodEntry {
  date: string; // YYYY-MM-DD format
  mood: string;
  color: string;
}

interface CalendarProps {
  moodEntries?: MoodEntry[];
  selectedDate?: string;
  onDateSelect?: (date: string) => void;
  month?: number; // 0-11
  year?: number;
  style?: ViewStyle;
  showMoodIndicators?: boolean;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function Calendar({
  moodEntries = [],
  selectedDate,
  onDateSelect,
  month,
  year,
  style,
  showMoodIndicators = true,
}: CalendarProps) {
  const { theme } = useTheme();
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(month ?? currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(year ?? currentDate.getFullYear());

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getMoodForDate = (day: number) => {
    const dateString = formatDate(day);
    return moodEntries.find(entry => entry.date === dateString);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return selectedDate === formatDate(day);
  };

  const handleDatePress = (day: number) => {
    const dateString = formatDate(day);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDateSelect?.(dateString);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigateMonth('prev')}
        style={styles.navButton}
      >
        <Text style={[styles.navButtonText, { color: theme.colors.primary }]}>
          ‹
        </Text>
      </TouchableOpacity>
      
      <Text style={[styles.monthYear, { color: theme.colors.text }]}>
        {MONTHS[currentMonth]} {currentYear}
      </Text>
      
      <TouchableOpacity
        onPress={() => navigateMonth('next')}
        style={styles.navButton}
      >
        <Text style={[styles.navButtonText, { color: theme.colors.primary }]}>
          ›
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderDaysOfWeek = () => (
    <View style={styles.daysOfWeek}>
      {DAYS_OF_WEEK.map(day => (
        <Text
          key={day}
          style={[styles.dayOfWeek, { color: theme.colors.textSecondary }]}
        >
          {day}
        </Text>
      ))}
    </View>
  );

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell} />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const mood = getMoodForDate(day);
      const today = isToday(day);
      const selected = isSelected(day);

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            styles.dayButton,
            today && { backgroundColor: theme.colors.primary + '20' },
            selected && { backgroundColor: theme.colors.primary },
          ]}
          onPress={() => handleDatePress(day)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.dayText,
              { color: theme.colors.text },
              today && { color: theme.colors.primary },
              selected && { color: '#FFFFFF' },
            ]}
          >
            {day}
          </Text>
          
          {showMoodIndicators && mood && (
            <View
              style={[
                styles.moodIndicator,
                { backgroundColor: mood.color },
                selected && { backgroundColor: '#FFFFFF' },
              ]}
            />
          )}
        </TouchableOpacity>
      );
    }

    return <View style={styles.calendar}>{days}</View>;
  };

  return (
    <View style={[styles.container, style]}>
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCalendarDays()}
    </View>
  );
}

// Compact calendar for stat cards
export function CompactCalendar({
  moodEntries = [],
  month,
  year,
  style,
}: Omit<CalendarProps, 'selectedDate' | 'onDateSelect'>) {
  const { theme } = useTheme();
  const currentDate = new Date();
  const calendarMonth = month ?? currentDate.getMonth();
  const calendarYear = year ?? currentDate.getFullYear();

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (day: number) => {
    return `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getMoodForDate = (day: number) => {
    const dateString = formatDate(day);
    return moodEntries.find(entry => entry.date === dateString);
  };

  const renderCompactDays = () => {
    const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
    const firstDay = getFirstDayOfMonth(calendarMonth, calendarYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.compactDayCell} />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const mood = getMoodForDate(day);

      days.push(
        <View
          key={day}
          style={[
            styles.compactDayCell,
            mood && { backgroundColor: mood.color + '40' },
          ]}
        >
          {mood && (
            <View
              style={[
                styles.compactMoodDot,
                { backgroundColor: mood.color },
              ]}
            />
          )}
        </View>
      );
    }

    return <View style={styles.compactCalendar}>{days}</View>;
  };

  return (
    <View style={[styles.compactContainer, style]}>
      <Text style={[styles.compactHeader, { color: theme.colors.textSecondary }]}>
        {MONTHS[calendarMonth]} {calendarYear}
      </Text>
      {renderCompactDays()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  navButton: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
  },
  daysOfWeek: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  dayOfWeek: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    paddingVertical: 8,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  dayCell: {
    width: '14.28%', // 100% / 7 days
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  dayButton: {
    borderRadius: 8,
    position: 'relative',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  moodIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  // Compact calendar styles
  compactContainer: {
    backgroundColor: 'transparent',
  },  compactHeader: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 6,
    textAlign: 'center',
  },compactCalendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: 150, // Constrain width to fit in stat cards
  },
  compactDayCell: {
    width: '14.28%',
    aspectRatio: 1,
    margin: 0.5, // Reduce margin for tighter layout
    borderRadius: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 8, // Ensure minimum size
  },
  compactMoodDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
});