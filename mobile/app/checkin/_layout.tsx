import { Stack } from "expo-router";
import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

export default function CheckinLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "modal",
        gestureEnabled: true,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="step1" />
      <Stack.Screen name="step2" />
      <Stack.Screen name="step3" />
      <Stack.Screen name="step4" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
