import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { CheckInProvider } from "@/contexts/CheckInContext";
import { queryClient } from "@/lib/queryClient";

function AppWithTheme() {
  const { colorScheme } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <NavigationThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="checkin" options={{ headerShown: false }} />
            <Stack.Screen
              name="addJournal"
              options={{
                headerShown: false,
                presentation: "transparentModal", // Changed from "modal"
                animation: "default", // Changed from "fade"
                gestureEnabled: true,
                gestureDirection: "vertical",
                contentStyle: { backgroundColor: "transparent" }, // Kept for
              }}
            />
            <Stack.Screen
              name="addAudioJournal"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="entryDetails"
              options={{
                headerShown: false,
                presentation: "transparentModal", // Changed from "modal"
                animation: "fade_from_bottom", // Changed from "fade"
                gestureEnabled: true,
                gestureDirection: "vertical",
                contentStyle: { backgroundColor: "transparent" }, // Kept for safety, might be redundant
              }}
            />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </NavigationThemeProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Return a simple loading state while fonts load
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CheckInProvider>
            <AppWithTheme />
          </CheckInProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
