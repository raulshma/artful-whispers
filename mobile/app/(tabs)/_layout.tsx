import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useTheme } from '@/contexts/ThemeContext';

export default function TabLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ProtectedRoute>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: 'absolute',
              backgroundColor: theme.colors.surface + 'CC', // Semi-transparent
              borderTopColor: theme.colors.border,
              paddingBottom: Math.max(insets.bottom, 8), // Use safe area or minimum 8px
              paddingTop: 8,
              height: 64 + Math.max(insets.bottom, 8), // Adjust height based on safe area
            },
            default: {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.border,
              borderTopWidth: 1,
              paddingBottom: Math.max(insets.bottom, 8), // Use safe area or minimum 8px
              paddingTop: 8,
              height: 64 + Math.max(insets.bottom, 8), // Adjust height based on safe area
            },
          }),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            fontFamily: 'Inter-Medium',
            marginBottom: 4, // Add margin to lift labels from bottom
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Stats',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="chart.bar.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="checkin"
          options={{
            title: 'Check In',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="plus.circle.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            title: 'Journal',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="book.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.fill" color={color} />,
          }}
        />
      </Tabs>
    </ProtectedRoute>
  );
}
