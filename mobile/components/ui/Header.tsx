import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { IconSymbol } from './IconSymbol';
import * as Haptics from 'expo-haptics';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  backgroundColor?: string;
  variant?: 'default' | 'large' | 'minimal';
  statusBarStyle?: 'auto' | 'light' | 'dark';
}

export function Header({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  rightComponent,
  leftComponent,
  style,
  titleStyle,
  backgroundColor,
  variant = 'default',
  statusBarStyle = 'auto',
}: HeaderProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const getHeaderStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      paddingTop: insets.top,
      backgroundColor: backgroundColor || theme.colors.surface,
      borderBottomWidth: variant === 'minimal' ? 0 : 1,
      borderBottomColor: theme.colors.border,
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {
        paddingHorizontal: theme.spacing.md,
        paddingBottom: theme.spacing.md,
        minHeight: 56 + insets.top,
      },
      large: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.lg,
        minHeight: 80 + insets.top,
      },
      minimal: {
        paddingHorizontal: theme.spacing.md,
        paddingBottom: theme.spacing.sm,
        minHeight: 44 + insets.top,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  const getTitleStyle = (): TextStyle => {
    const variantStyles: Record<string, TextStyle> = {
      default: theme.typography.h3,
      large: theme.typography.h2,
      minimal: theme.typography.h4,
    };

    return {
      ...variantStyles[variant],
      color: theme.colors.text,
      textAlign: 'center',
      flex: 1,
    };
  };

  const getSubtitleStyle = (): TextStyle => ({
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  });

  return (
    <>
      <StatusBar
        barStyle={
          statusBarStyle === 'auto'
            ? theme.isDark
              ? 'light-content'
              : 'dark-content'
            : statusBarStyle === 'light'
            ? 'light-content'
            : 'dark-content'
        }
        backgroundColor={backgroundColor || theme.colors.surface}
      />
      <View style={[getHeaderStyle(), style]}>
        <View style={styles.headerContent}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            {showBackButton && (
              <TouchableOpacity
                onPress={handleBackPress}
                style={styles.backButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <IconSymbol
                  name="chevron.left"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
            )}
            {leftComponent && !showBackButton && leftComponent}
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            {title && (
              <Text style={[getTitleStyle(), titleStyle]} numberOfLines={1}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={getSubtitleStyle()} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>

          {/* Right Section */}
          <View style={styles.rightSection}>
            {rightComponent}
          </View>
        </View>
      </View>
    </>
  );
}

// Specialized header components
export function NavigationHeader({
  title,
  onBackPress,
  rightComponent,
  ...props
}: Omit<HeaderProps, 'showBackButton'>) {
  return (
    <Header
      title={title}
      showBackButton
      onBackPress={onBackPress}
      rightComponent={rightComponent}
      variant="default"
      {...props}
    />
  );
}

export function LargeHeader({
  title,
  subtitle,
  rightComponent,
  ...props
}: HeaderProps) {
  return (
    <Header
      title={title}
      subtitle={subtitle}
      rightComponent={rightComponent}
      variant="large"
      {...props}
    />
  );
}

export function MinimalHeader({
  title,
  rightComponent,
  ...props
}: HeaderProps) {
  return (
    <Header
      title={title}
      rightComponent={rightComponent}
      variant="minimal"
      {...props}
    />
  );
}

// Header action components
export function HeaderIconButton({
  iconName,
  onPress,
  color,
  size = 24,
}: {
  iconName: string;
  onPress: () => void;
  color?: string;
  size?: number;
}) {
  const { theme } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.iconButton}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <IconSymbol
        name={iconName}
        size={size}
        color={color || theme.colors.text}
      />
    </TouchableOpacity>
  );
}

export function HeaderNotificationButton({
  onPress,
  hasNotifications = false,
}: {
  onPress: () => void;
  hasNotifications?: boolean;
}) {
  const { theme } = useTheme();

  return (
    <View>
      <HeaderIconButton
        iconName="bell"
        onPress={onPress}
      />
      {hasNotifications && (
        <View style={[
          styles.notificationDot,
          { backgroundColor: theme.colors.semantic.error }
        ]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButton: {
    padding: 4,
  },
  iconButton: {
    padding: 4,
  },
  notificationDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});