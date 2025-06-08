import { Stack } from "expo-router";
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

export default function StatsLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="journal-advanced" />
      <Stack.Screen name="mood-advanced" />
      <Stack.Screen name="calendar-advanced" />
    </Stack>
  );
}
