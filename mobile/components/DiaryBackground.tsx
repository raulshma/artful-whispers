import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/useColorScheme';

interface DiaryBackgroundProps {
  imageUrl: string | null;
}

export default function DiaryBackground({ imageUrl }: DiaryBackgroundProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container}>
      {/* Base background layer */}
      <View 
        style={[
          styles.baseBackground, 
          { backgroundColor: isDark ? '#0a0b0d' : '#fffef7' }
        ]} 
      />
      
      {imageUrl && (
        <ImageBackground
          source={{ uri: imageUrl }}
          style={styles.imageBackground}
          resizeMode="cover"
        >
          <BlurView
            intensity={isDark ? 85 : 80}
            style={styles.blurOverlay}
            tint={isDark ? 'dark' : 'light'}
          />
        </ImageBackground>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  baseBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
