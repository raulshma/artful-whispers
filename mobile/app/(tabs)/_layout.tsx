import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconSymbol } from "@/components/ui/IconSymbol";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useTheme } from "@/contexts/ThemeContext";
import { TabProvider, useTabContext } from "@/contexts/TabContext";
import { FloatingTabBarComponent } from "@/components/ui/FloatingTabBarComponent";
import { DynamicTabBackground } from "@/components/ui/DynamicTabBackground";

function TabLayoutContent() {
  const { theme } = useTheme();
  const { activeTabIndex, totalTabs } = useTabContext();

  return (
    <>
      {/* Dynamic background that responds to tab changes */}
      <DynamicTabBackground activeIndex={activeTabIndex} totalTabs={totalTabs} />
      
      <Tabs
        tabBar={(props) => <FloatingTabBarComponent {...props} />}
        screenOptions={{
          headerShown: false,
          // Hide the default tab bar since we're using a custom floating one
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen
          name="journal"
          options={{
            title: "Journal",
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: "Stats",
          }}
        />
        <Tabs.Screen
          name="checkin"
          options={{
            title: "Check In",
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
          }}
        />
      </Tabs>
    </>
  );
}

export default function TabLayout() {
  return (
    <ProtectedRoute>
      <TabProvider>
        <TabLayoutContent />
      </TabProvider>
    </ProtectedRoute>
  );
}
