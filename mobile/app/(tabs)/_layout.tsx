import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useTheme } from "@/contexts/ThemeContext";

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
          // Enhanced tab bar styling with animations
          tabBarStyle: Platform.select({
            ios: {
              position: "absolute",
              backgroundColor: theme.colors.surface + "CC",
              borderTopColor: theme.colors.border,
              borderTopWidth: 0.5,
              paddingBottom: Math.max(insets.bottom, 8),
              paddingTop: 8,
              height: 64 + Math.max(insets.bottom, 8),
              shadowColor: theme.colors.text,
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 12,
              // Enhanced blur and transparency
              borderRadius: 0,
            },
            default: {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.border,
              borderTopWidth: 1,
              paddingBottom: Math.max(insets.bottom, 8),
              paddingTop: 8,
              height: 64 + Math.max(insets.bottom, 8),
              shadowColor: theme.colors.text,
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.15,
              shadowRadius: 6,
              elevation: 12,
            },
          }),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            fontFamily: "Inter-Medium",
            marginBottom: 4,
            marginTop: 2,
          },
          tabBarIconStyle: {
            marginTop: 2,
          },
          // Tab bar item animation configurations
          tabBarItemStyle: {
            paddingVertical: 4,
          },
        }}
      >
        <Tabs.Screen
          name="journal"
          options={{
            title: "Journal",
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol
                size={focused ? 26 : 24}
                name="book.fill"
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: "Stats",
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol
                size={focused ? 26 : 24}
                name="chart.bar.fill"
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="checkin"
          options={{
            title: "Check In",
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol
                size={focused ? 26 : 24}
                name="plus.circle.fill"
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol
                size={focused ? 26 : 24}
                name="person.fill"
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </ProtectedRoute>
  );
}
