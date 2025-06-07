import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Canvas,
  RoundedRect,
  LinearGradient,
  vec,
  Shadow,
  Group,
} from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useDerivedValue,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

interface FloatingTabBarProps {
  children: React.ReactNode;
  activeIndex: number;
  totalTabs: number;
}

const { width: screenWidth } = Dimensions.get('window');
const TAB_BAR_WIDTH = screenWidth - 40; // 20px margin on each side
const TAB_BAR_HEIGHT = 68;
const BORDER_RADIUS = 24;
const CONTENT_PADDING_HORIZONTAL = 12; // Padding inside the tab bar where buttons are placed
const INDICATOR_INTERNAL_PADDING = 24; // Padding for the indicator visuals relative to its slot

export function FloatingTabBar({ children, activeIndex, totalTabs }: FloatingTabBarProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const animatedScale = useSharedValue(1);
  const animatedOpacity = useSharedValue(0.95);
  const indicatorPosition = useSharedValue(activeIndex); // Initialize with activeIndex

  // Calculate dimensions based on content area
  const contentAreaWidth = TAB_BAR_WIDTH - (2 * CONTENT_PADDING_HORIZONTAL);
  const effectiveTabSlotWidth = contentAreaWidth / totalTabs;
  const indicatorRenderWidth = effectiveTabSlotWidth - INDICATOR_INTERNAL_PADDING;
  
  // Derived value for indicator position - centered on the active tab
  const indicatorX = useDerivedValue(() => {
    // Calculate the center of the active tab's slot within the content area
    const activeSlotCenterInContentArea = (indicatorPosition.value + 0.5) * effectiveTabSlotWidth;
    // Adjust for the tab bar's own content padding to get the absolute center
    const absoluteActiveSlotCenter = CONTENT_PADDING_HORIZONTAL + activeSlotCenterInContentArea;
    // Position the indicator by subtracting half its own width from the absolute center
    return absoluteActiveSlotCenter - (indicatorRenderWidth / 2);
  });
  
  useEffect(() => {
    // Animate indicatorPosition (which represents activeIndex)
    indicatorPosition.value = withSpring(
      activeIndex,
      { damping: 20, stiffness: 300 }
    );
    
    // Subtle scale animation on tab change
    animatedScale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    setTimeout(() => {
      animatedScale.value = withSpring(1, { damping: 15, stiffness: 400 });
    }, 100);
  }, [activeIndex, totalTabs, effectiveTabSlotWidth, indicatorRenderWidth, animatedScale, indicatorPosition]); // Added animatedScale and indicatorPosition

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animatedScale.value }],
    opacity: animatedOpacity.value,
  }));

  const gradientColors = [
    theme.colors.surface + 'FF',
    theme.colors.surface + 'F8',
    theme.colors.surface + 'FF',
  ];

  const shadowColor = theme.colors.text + '15';

  return (
    <View style={[styles.container, { bottom: insets.bottom + 20 }]}>
      <Animated.View style={[styles.tabBarContainer, containerStyle]}>
        {/* Skia Canvas for visual effects */}
        <Canvas style={StyleSheet.absoluteFill}>
          <Group>
            {/* Main tab bar background with gradient */}
            <RoundedRect
              x={0}
              y={0}
              width={TAB_BAR_WIDTH}
              height={TAB_BAR_HEIGHT}
              r={BORDER_RADIUS}
            >
              <LinearGradient
                start={vec(0, 0)}
                end={vec(0, TAB_BAR_HEIGHT)}
                colors={gradientColors}
              />
              <Shadow
                dx={0}
                dy={8}
                blur={24}
                color={shadowColor}
              />
              <Shadow
                dx={0}
                dy={2}
                blur={8}
                color={shadowColor}
              />
            </RoundedRect>
            
            {/* Active tab indicator */}
            <Group>
              <RoundedRect
                x={indicatorX} // Use the derived value
                y={12} // Fixed y position
                width={indicatorRenderWidth} // Use calculated render width
                height={TAB_BAR_HEIGHT - 24} // Fixed height
                r={16} // Fixed border radius for indicator
              >
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec(0, TAB_BAR_HEIGHT - 24)}
                  colors={[
                    theme.colors.primary + '20',
                    theme.colors.primary + '10',
                    theme.colors.primary + '20',
                  ]}
                />
              </RoundedRect>
            </Group>

            {/* Subtle border overlay */}
            <RoundedRect
              x={1}
              y={1}
              width={TAB_BAR_WIDTH - 2}
              height={TAB_BAR_HEIGHT - 2}
              r={BORDER_RADIUS - 1}
              style="stroke"
              strokeWidth={1}
              color={theme.colors.border + '40'}
            />
          </Group>
        </Canvas>

        {/* Tab content */}
        <View style={styles.tabContent}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  tabBarContainer: {
    width: TAB_BAR_WIDTH,
    height: TAB_BAR_HEIGHT,
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Fallback background
  },
  tabContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: CONTENT_PADDING_HORIZONTAL, // Use the constant
  },
});
