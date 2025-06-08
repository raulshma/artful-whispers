import React, { useRef } from "react";
import { View, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "expo-router";

interface FloatingComposeButtonProps {
  hasEntriesToday?: boolean;
}

export default function FloatingComposeButton({
  hasEntriesToday = false,
}: FloatingComposeButtonProps) {
  const { theme } = useTheme();
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    router.push("/addJournal");
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <View style={styles.gradientButton}>
            <Ionicons
              name="create-outline"
              size={26}
              color={theme.colors.text}
            />

            {/* Small indicator for multiple entries */}
            {hasEntriesToday && (
              <View
                style={[
                  styles.indicator,
                  {
                    backgroundColor: theme.colors.accent,
                    borderColor: theme.colors.text,
                  },
                ]}
              />
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 95,
    right: 20,
    zIndex: 1100,
  },
  buttonContainer: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: "hidden",
  },
  gradientButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  indicator: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
});
