import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { FloatingTabBar } from "./FloatingTabBar";
import { FloatingTabButton } from "./FloatingTabButton";
import { useTheme } from "@/contexts/ThemeContext";
import { useTabContext } from "@/contexts/TabContext";

interface TabConfig {
  name: string;
  icon: string;
  label: string;
}

const TAB_CONFIGS: Record<string, TabConfig> = {
  journal: { name: "journal", icon: "book.fill", label: "Journal" },
  stats: { name: "stats", icon: "chart.bar.fill", label: "Stats" },
  checkin: { name: "checkin", icon: "plus.circle.fill", label: "Check In" },
  profile: { name: "profile", icon: "person.fill", label: "Profile" },
};

export function FloatingTabBarComponent({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { theme } = useTheme();
  const { setActiveTabIndex } = useTabContext();
  const [activeIndex, setActiveIndex] = useState(state.index);

  useEffect(() => {
    setActiveIndex(state.index);
    setActiveTabIndex(state.index);
  }, [state.index, setActiveTabIndex]);

  const handleTabPress = (route: any, index: number) => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  return (
    <FloatingTabBar activeIndex={activeIndex} totalTabs={state.routes.length}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const config = TAB_CONFIGS[route.name];

        if (!config) {
          console.warn(`No tab config found for route: ${route.name}`);
          return null;
        }

        return (
          <FloatingTabButton
            key={route.key}
            icon={config.icon}
            label={config.label}
            isActive={isFocused}
            onPress={() => handleTabPress(route, index)}
            color={theme.colors.textSecondary}
            activeColor={theme.colors.primary}
          />
        );
      })}
    </FloatingTabBar>
  );
}

const styles = StyleSheet.create({
  // No styles needed as FloatingTabBar handles container styling
});
