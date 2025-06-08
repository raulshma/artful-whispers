import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "./Button";
import { SkiaLoadingAnimation } from "./SkiaLoadingAnimation";
import { LoadingAnimation } from "./LoadingAnimation";
import { useTheme } from "@/contexts/ThemeContext";

export function SkiaLoadingDemo() {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<
    "ripple" | "morphing" | "orbital" | "breathing"
  >("ripple");

  const variants = [
    {
      key: "ripple" as const,
      name: "Ripple Animation",
      description: "Expanding concentric circles",
    },
    {
      key: "morphing" as const,
      name: "Morphing Blob",
      description: "Shape-shifting organic form",
    },
    {
      key: "orbital" as const,
      name: "Orbital Particles",
      description: "Particles orbiting around center",
    },
    {
      key: "breathing" as const,
      name: "Breathing Circles",
      description: "Pulsing organic shape",
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={[styles.title, { color: theme.colors.text }]}>
          Skia Loading Animations
        </ThemedText>

        <ThemedText
          style={[styles.subtitle, { color: theme.colors.textSecondary }]}
        >
          Visually appealing 2D animations with seamless hide/show transitions
        </ThemedText>

        {/* Visibility Toggle */}
        <View style={styles.controls}>
          <Button
            title={visible ? "Hide Animation" : "Show Animation"}
            onPress={() => setVisible(!visible)}
            variant={visible ? "secondary" : "primary"}
          />
        </View>

        {/* Variant Selection */}
        <View style={styles.variantContainer}>
          <ThemedText
            style={[styles.sectionTitle, { color: theme.colors.text }]}
          >
            Animation Variants
          </ThemedText>

          <View style={styles.variantButtons}>
            {variants.map((variant) => (
              <Button
                key={variant.key}
                title={variant.name}
                onPress={() => setSelectedVariant(variant.key)}
                variant={
                  selectedVariant === variant.key ? "primary" : "secondary"
                }
                style={styles.variantButton}
              />
            ))}
          </View>
        </View>

        {/* Current Animation Display */}
        <View
          style={[
            styles.animationContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <ThemedText
            style={[styles.currentVariant, { color: theme.colors.text }]}
          >
            {variants.find((v) => v.key === selectedVariant)?.name}
          </ThemedText>

          <ThemedText
            style={[styles.description, { color: theme.colors.textSecondary }]}
          >
            {variants.find((v) => v.key === selectedVariant)?.description}
          </ThemedText>

          <View style={styles.animationWrapper}>
            <SkiaLoadingAnimation
              variant={selectedVariant}
              size={120}
              color={theme.colors.primary}
              visible={visible}
            />
          </View>
        </View>

        {/* Comparison with Standard Loading */}
        <View
          style={[
            styles.comparisonContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <ThemedText
            style={[styles.sectionTitle, { color: theme.colors.text }]}
          >
            Comparison with Standard Loading
          </ThemedText>

          <View style={styles.comparisonRow}>
            <View style={styles.comparisonItem}>
              <ThemedText
                style={[
                  styles.comparisonLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Standard Spinner
              </ThemedText>
              <LoadingAnimation
                variant="spinner"
                size={60}
                color={theme.colors.primary}
                visible={visible}
              />
            </View>

            <View style={styles.comparisonItem}>
              <ThemedText
                style={[
                  styles.comparisonLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Skia Ripple
              </ThemedText>
              <SkiaLoadingAnimation
                variant="ripple"
                size={60}
                color={theme.colors.primary}
                visible={visible}
              />
            </View>
          </View>
        </View>

        {/* Usage Instructions */}
        <View
          style={[
            styles.usageContainer,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <ThemedText
            style={[styles.sectionTitle, { color: theme.colors.text }]}
          >
            Usage
          </ThemedText>

          <ThemedText
            style={[
              styles.codeExample,
              {
                color: theme.colors.textSecondary,
                backgroundColor: theme.colors.background,
              },
            ]}
          >
            {`// Direct Skia component
<SkiaLoadingAnimation
  variant="ripple"
  size={80}
  color="#007AFF"
  visible={true}
/>

// Through LoadingAnimation wrapper
<LoadingAnimation
  variant="skia-ripple"
  size={80}
  visible={true}
/>`}
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
  },
  controls: {
    marginBottom: 30,
    alignItems: "center",
  },
  variantContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
  },
  variantButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  variantButton: {
    minWidth: 120,
  },
  animationContainer: {
    borderRadius: 16,
    padding: 30,
    marginBottom: 30,
    alignItems: "center",
  },
  currentVariant: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 25,
    textAlign: "center",
  },
  animationWrapper: {
    height: 140,
    width: 140,
    justifyContent: "center",
    alignItems: "center",
  },
  comparisonContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
  },
  comparisonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  comparisonItem: {
    alignItems: "center",
    flex: 1,
  },
  comparisonLabel: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
  },
  usageContainer: {
    borderRadius: 16,
    padding: 20,
  },
  codeExample: {
    fontFamily: "monospace",
    fontSize: 12,
    padding: 15,
    borderRadius: 8,
    lineHeight: 18,
  },
});

export default SkiaLoadingDemo;
