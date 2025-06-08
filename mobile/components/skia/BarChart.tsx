import React, { useEffect } from "react";
import { View, Dimensions, Platform, Text } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

// Conditionally import Skia components only for native platforms
let Canvas: any,
  Rect: any,
  SkiaText: any,
  useFont: any,
  Group: any,
  RoundedRect: any;
let useSharedValue: any,
  withTiming: any,
  interpolate: any,
  useDerivedValue: any;

if (Platform.OS !== "web") {
  const SkiaComponents = require("@shopify/react-native-skia");
  Canvas = SkiaComponents.Canvas;
  Rect = SkiaComponents.Rect;
  SkiaText = SkiaComponents.Text;
  useFont = SkiaComponents.useFont;
  Group = SkiaComponents.Group;
  RoundedRect = SkiaComponents.RoundedRect;

  const ReanimatedComponents = require("react-native-reanimated");
  useSharedValue = ReanimatedComponents.useSharedValue;
  withTiming = ReanimatedComponents.withTiming;
  interpolate = ReanimatedComponents.interpolate;
  useDerivedValue = ReanimatedComponents.useDerivedValue;
}

interface BarChartData {
  label: string;
  value: number;
  color: string;
}

interface BarChartProps {
  data: BarChartData[];
  width?: number;
  height?: number;
  showLabels?: boolean;
  showValues?: boolean;
  animationDuration?: number;
  barRadius?: number;
  spacing?: number;
}

export function BarChart({
  data,
  width = Dimensions.get("window").width - 40,
  height = 200,
  showLabels = true,
  showValues = true,
  animationDuration = 1000,
  barRadius = 4,
  spacing = 8,
}: BarChartProps) {
  const { theme } = useTheme();

  // Safety checks before rendering
  if (!data.length) {
    console.log("BarChart: No data available");
    return <View style={{ width, height }} />;
  }

  // Web fallback - render simple CSS-based chart
  if (Platform.OS === "web") {
    console.log("BarChart: Rendering web fallback");
    const maxValue = Math.max(...data.map((item) => item.value));

    return (
      <View style={{ width, height, padding: 20 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-around",
            height: height - 60,
            gap: spacing,
          }}
        >
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * (height - 80);
            return (
              <View key={index} style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 10,
                    color: theme.colors.text,
                    marginBottom: 4,
                  }}
                >
                  {showValues ? item.value : ""}
                </Text>
                <View
                  style={{
                    width: Math.max(20, (width - 80) / data.length - spacing),
                    height: barHeight,
                    backgroundColor: item.color,
                    borderRadius: barRadius,
                  }}
                />
                {showLabels && (
                  <Text
                    style={{
                      fontSize: 9,
                      color: theme.colors.textSecondary,
                      marginTop: 4,
                      textAlign: "center",
                    }}
                  >
                    {item.label}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  }
  // Native platform - use Skia
  const animationProgress = useSharedValue(0);
  let font = null;

  try {
    font = useFont(require("../../assets/fonts/SpaceMono-Regular.ttf"), 12);
    console.log("BarChart: Native font loaded successfully:", !!font);
  } catch (error) {
    console.log(
      "BarChart: Native font loading failed, skipping text rendering"
    );
  }

  // Check if we should render text (font loaded and native platform)
  const shouldRenderText = (Platform.OS as string) !== "web" && font !== null;

  useEffect(() => {
    animationProgress.value = withTiming(1, { duration: animationDuration });
  }, [data, animationDuration]);

  const maxValue = Math.max(...data.map((item) => item.value));
  const chartHeight = height - (showLabels ? 40 : 20);
  const chartWidth = width - 40;
  const barWidth = (chartWidth - (data.length - 1) * spacing) / data.length;

  const animatedBars = useDerivedValue(() => {
    return data.map((item, index) => {
      const barHeight = interpolate(
        animationProgress.value,
        [0, 1],
        [0, (item.value / maxValue) * chartHeight]
      );

      const x = 20 + index * (barWidth + spacing);
      const y = chartHeight - barHeight + 10;

      return {
        x,
        y,
        width: barWidth,
        height: barHeight,
        color: item.color,
        label: item.label,
        value: item.value,
      };
    });
  });

  return (
    <View style={{ width, height }}>
      <Canvas style={{ flex: 1 }}>
        <Group>
          {/* Render bars */}
          {data.map((item, index) => {
            const x = 20 + index * (barWidth + spacing);
            const maxBarHeight = (item.value / maxValue) * chartHeight;

            return (
              <Group key={`bar-${index}`}>
                <RoundedRect
                  x={x}
                  y={chartHeight - maxBarHeight + 10}
                  width={barWidth}
                  height={maxBarHeight * animationProgress.value}
                  r={barRadius}
                  color={item.color}
                />

                {/* Value labels - only render on native platforms */}
                {showValues && shouldRenderText && font && (
                  <SkiaText
                    x={x + barWidth / 2}
                    y={chartHeight - maxBarHeight * animationProgress.value + 5}
                    text={item.value.toString()}
                    font={font}
                    color={theme.colors.text}
                  />
                )}

                {/* Category labels - only render on native platforms */}
                {showLabels && shouldRenderText && font && (
                  <SkiaText
                    x={x + barWidth / 2}
                    y={chartHeight + 30}
                    text={item.label}
                    font={font}
                    color={theme.colors.textSecondary}
                  />
                )}
              </Group>
            );
          })}
        </Group>
      </Canvas>
    </View>
  );
}

// Horizontal Bar Chart for "Most frequent emotion" card
interface HorizontalBarData {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

interface HorizontalBarChartProps {
  data: HorizontalBarData[];
  width?: number;
  height?: number;
  showPercentages?: boolean;
  animationDuration?: number;
  barHeight?: number;
  spacing?: number;
}

export function HorizontalBarChart({
  data,
  width = 280,
  height = 150,
  showPercentages = true,
  animationDuration = 800,
  barHeight = 20,
  spacing = 12,
}: HorizontalBarChartProps) {
  const { theme } = useTheme();

  // Safety checks before rendering
  if (!data.length) {
    console.log("HorizontalBarChart: No data available");
    return <View style={{ width, height }} />;
  }

  // Web fallback - render simple CSS-based chart
  if (Platform.OS === "web") {
    console.log("HorizontalBarChart: Rendering web fallback");
    const maxValue = Math.max(...data.map((item) => item.value));

    return (
      <View style={{ width, height, padding: 10 }}>
        {data.map((item, index) => {
          const barWidth = (item.value / maxValue) * (width - 80);
          const y = index * (barHeight + spacing);

          return (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: spacing,
                height: barHeight,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  color: theme.colors.text,
                  width: 50,
                  textAlign: "left",
                }}
              >
                {item.label}
              </Text>
              <View style={{ flex: 1, marginHorizontal: 8 }}>
                <View
                  style={{
                    width: "100%",
                    height: barHeight,
                    backgroundColor: theme.colors.backgroundTertiary,
                    borderRadius: barHeight / 2,
                  }}
                />
                <View
                  style={{
                    position: "absolute",
                    width: `${(item.value / maxValue) * 100}%`,
                    height: barHeight,
                    backgroundColor: item.color,
                    borderRadius: barHeight / 2,
                  }}
                />
              </View>
              {showPercentages && (
                <Text
                  style={{
                    fontSize: 10,
                    color: theme.colors.textSecondary,
                    width: 30,
                    textAlign: "right",
                  }}
                >
                  {item.percentage}%
                </Text>
              )}
            </View>
          );
        })}
      </View>
    );
  }
  // Native platform - use Skia
  const animationProgress = useSharedValue(0);
  let font = null;

  try {
    font = useFont(require("../../assets/fonts/SpaceMono-Regular.ttf"), 11);
    console.log("HorizontalBarChart: Native font loaded successfully:", !!font);
  } catch (error) {
    console.log(
      "HorizontalBarChart: Native font loading failed, skipping text rendering"
    );
  }

  // Check if we should render text (font loaded and native platform)
  const shouldRenderText = (Platform.OS as string) !== "web" && font !== null;

  useEffect(() => {
    animationProgress.value = withTiming(1, { duration: animationDuration });
  }, [data, animationDuration]);

  const chartWidth = width - 80; // Leave space for labels
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <View style={{ width, height }}>
      <Canvas style={{ flex: 1 }}>
        <Group>
          {data.map((item, index) => {
            const y = 10 + index * (barHeight + spacing);
            const maxBarWidth = (item.value / maxValue) * chartWidth;

            return (
              <Group key={`hbar-${index}`}>
                {/* Bar background */}
                <RoundedRect
                  x={60}
                  y={y}
                  width={chartWidth}
                  height={barHeight}
                  r={barHeight / 2}
                  color={theme.colors.backgroundTertiary}
                />

                {/* Animated bar */}
                <RoundedRect
                  x={60}
                  y={y}
                  width={maxBarWidth * animationProgress.value}
                  height={barHeight}
                  r={barHeight / 2}
                  color={item.color}
                />

                {/* Label - only render on native platforms */}
                {shouldRenderText && font && (
                  <SkiaText
                    x={10}
                    y={y + barHeight / 2 + 4}
                    text={item.label}
                    font={font}
                    color={theme.colors.text}
                  />
                )}

                {/* Percentage - only render on native platforms */}
                {showPercentages && shouldRenderText && font && (
                  <SkiaText
                    x={70 + maxBarWidth * animationProgress.value + 8}
                    y={y + barHeight / 2 + 4}
                    text={`${item.percentage}%`}
                    font={font}
                    color={theme.colors.textSecondary}
                  />
                )}
              </Group>
            );
          })}
        </Group>
      </Canvas>
    </View>
  );
}
