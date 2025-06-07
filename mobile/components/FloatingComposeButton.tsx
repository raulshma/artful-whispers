import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';

interface FloatingComposeButtonProps {
  hasEntriesToday?: boolean;
}

export default function FloatingComposeButton({
  hasEntriesToday = false,
}: FloatingComposeButtonProps) {
  const { theme } = useTheme();
  const router = useRouter();

  const handlePress = () => {
    router.push('/addJournal');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            borderColor: theme.colors.border,
          }
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <BlurView
          intensity={theme.isDark ? 30 : 20}
          style={styles.blurButton}
          tint={theme.isDark ? 'dark' : 'light'}
        >
          <Ionicons 
            name="add" 
            size={24} 
            color={theme.colors.text} 
          />
          
          {/* Small indicator for multiple entries */}
          {hasEntriesToday && (
            <View style={[
              styles.indicator,
              {
                backgroundColor: theme.colors.primary,
                borderColor: theme.colors.background,
              }
            ]} />
          )}
        </BlurView>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 30,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  blurButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
});
