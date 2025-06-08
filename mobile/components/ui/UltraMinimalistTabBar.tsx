import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import * as Haptics from "expo-haptics";

interface TabConfig {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

const TAB_CONFIGS: Record<string, TabConfig> = {
  journal: { name: "journal", icon: "book", label: "Journal" },
  stats: { name: "stats", icon: "analytics", label: "Stats" },
  checkin: { name: "checkin", icon: "add", label: "Check In" },
  profile: { name: "profile", icon: "person", label: "Profile" },
};

export function UltraMinimalistTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const handleTabPress = (route: any, index: number) => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      if (state.index !== index) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      navigation.navigate(route.name);
    }
  };

  return (
    <View style={[
      styles.container, 
      { 
        bottom: insets.bottom,
        backgroundColor: theme.colors.surface,
      }
    ]}>
      <View style={[
        styles.tabContainer,
        { borderTopColor: theme.colors.border + "20" }
      ]}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const config = TAB_CONFIGS[route.name];

          if (!config) return null;

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabButton}
              onPress={() => handleTabPress(route, index)}
              activeOpacity={0.8}
            >
              {/* Simple dot indicator for active state */}
              {isFocused && (
                <View style={[
                  styles.activeIndicator,
                  { backgroundColor: theme.colors.primary }
                ]} />
              )}
              
              <Ionicons
                name={config.icon}
                size={20}
                color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
                style={{ opacity: isFocused ? 1 : 0.6 }}
              />
              
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? theme.colors.primary : theme.colors.textSecondary,
                    opacity: isFocused ? 1 : 0.6,
                  },
                ]}
              >
                {config.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  tabContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    position: "relative",
  },
  activeIndicator: {
    position: "absolute",
    top: 0,
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 4,
    letterSpacing: 0.3,
  },
});
