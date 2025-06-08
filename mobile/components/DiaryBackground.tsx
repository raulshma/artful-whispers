import React, { useEffect, useState } from "react";
import { View, StyleSheet, ImageBackground, Animated } from "react-native";
import { BlurView } from "expo-blur";
import { useColorScheme } from "@/hooks/useColorScheme";

interface DiaryBackgroundProps {
  imageUrl: string | null;
}

export default function DiaryBackground({ imageUrl }: DiaryBackgroundProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(
    imageUrl
  );
  const [fadeAnim] = useState(new Animated.Value(imageUrl ? 1 : 0));
  useEffect(() => {
    console.log("DiaryBackground imageUrl changed:", {
      from: currentImageUrl,
      to: imageUrl,
    });

    if (imageUrl !== currentImageUrl) {
      if (currentImageUrl && imageUrl) {
        // Crossfade between images
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setCurrentImageUrl(imageUrl);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }).start();
        });
      } else if (imageUrl && !currentImageUrl) {
        // Fade in new image
        setCurrentImageUrl(imageUrl);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      } else if (!imageUrl && currentImageUrl) {
        // Fade out current image
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setCurrentImageUrl(null);
        });
      }
    }
  }, [imageUrl, currentImageUrl, fadeAnim]);

  return (
    <View style={styles.container}>
      {/* Base background layer */}
      <View
        style={[
          styles.baseBackground,
          { backgroundColor: isDark ? "#0a0b0d" : "#fffef7" },
        ]}
      />
      {currentImageUrl && (
        <Animated.View style={[styles.imageContainer, { opacity: fadeAnim }]}>
          <ImageBackground
            source={{ uri: currentImageUrl }}
            style={styles.imageBackground}
            resizeMode="cover"
          >
            <BlurView
              intensity={isDark ? 85 : 80}
              style={styles.blurOverlay}
              tint={isDark ? "dark" : "light"}
            />
          </ImageBackground>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  baseBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blurOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
