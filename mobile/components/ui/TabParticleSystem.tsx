import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { Canvas, Circle, Group, Paint, Skia } from "@shopify/react-native-skia";
import Animated, {
  useSharedValue,
  useDerivedValue,
  withTiming,
  withSpring,
  withSequence,
  runOnUI,
} from "react-native-reanimated";
import { useTheme } from "@/contexts/ThemeContext";

interface Particle {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  scale: number;
  opacity: number;
  color: string;
}

interface TabParticleSystemProps {
  width: number;
  height: number;
  trigger: boolean;
  centerX: number;
  centerY: number;
  color: string;
}

export function TabParticleSystem({
  width,
  height,
  trigger,
  centerX,
  centerY,
  color,
}: TabParticleSystemProps) {
  const { theme } = useTheme();

  const animationProgress = useSharedValue(0);
  const particles = useSharedValue<Particle[]>([]);

  const createParticles = () => {
    "worklet";
    const newParticles: Particle[] = [];
    const particleCount = 12;

    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const distance = 30 + Math.random() * 40;
      const targetDistance = distance + 20 + Math.random() * 30;

      newParticles.push({
        id: i,
        x: centerX,
        y: centerY,
        targetX: centerX + Math.cos(angle) * targetDistance,
        targetY: centerY + Math.sin(angle) * targetDistance,
        scale: 0.5 + Math.random() * 0.5,
        opacity: 0.8 + Math.random() * 0.2,
        color: color + Math.floor(Math.random() * 100 + 100).toString(16),
      });
    }

    particles.value = newParticles;
  };

  useEffect(() => {
    if (trigger) {
      runOnUI(createParticles)();
      animationProgress.value = 0;
      animationProgress.value = withSequence(
        withSpring(1, { damping: 15, stiffness: 300 }),
        withTiming(0, { duration: 500 })
      );
    }
  }, [trigger]);
  const animatedParticles = useDerivedValue(() => {
    const progress = animationProgress.value;

    return particles.value.map((particle) => {
      const x = particle.x + (particle.targetX - particle.x) * progress;
      const y = particle.y + (particle.targetY - particle.y) * progress;
      const scale = particle.scale * (1 - progress * 0.5);
      const opacity = particle.opacity * (1 - progress);

      return {
        ...particle,
        x,
        y,
        scale,
        opacity,
      };
    });
  });

  // Create individual derived values for each particle to avoid .value access in render
  const particleComponents = Array.from({ length: 12 }, (_, index) => {
    const particleX = useDerivedValue(() => {
      const currentParticles = animatedParticles.value;
      return currentParticles[index]?.x || centerX;
    });

    const particleY = useDerivedValue(() => {
      const currentParticles = animatedParticles.value;
      return currentParticles[index]?.y || centerY;
    });

    const particleScale = useDerivedValue(() => {
      const currentParticles = animatedParticles.value;
      return Math.max(0, (currentParticles[index]?.scale || 0) * 2); // Ensure non-negative radius
    });

    const particleOpacity = useDerivedValue(() => {
      const currentParticles = animatedParticles.value;
      return Math.max(0, Math.min(1, currentParticles[index]?.opacity || 0)); // Clamp opacity
    });

    const particleColor = useDerivedValue(() => {
      const currentParticles = animatedParticles.value;
      return currentParticles[index]?.color || color;
    });

    return (
      <Circle
        key={`particle-${index}`}
        cx={particleX}
        cy={particleY}
        r={particleScale}
        opacity={particleOpacity}
        color={particleColor}
      />
    );
  });

  return (
    <Canvas style={[styles.canvas, { width, height }]} pointerEvents="none">
      <Group>{particleComponents}</Group>
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});
