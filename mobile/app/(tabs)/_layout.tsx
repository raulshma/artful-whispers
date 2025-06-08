import { Tabs } from "expo-router";
import React from "react";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TabProvider } from "@/contexts/TabContext";
import { UltraMinimalistTabBar } from "@/components/ui/UltraMinimalistTabBar";

function TabLayoutContent() {

  return (
    <>
      <Tabs
        tabBar={(props) => <UltraMinimalistTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          // Hide the default tab bar since we're using a custom floating one
          tabBarStyle: { display: "none" },
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
