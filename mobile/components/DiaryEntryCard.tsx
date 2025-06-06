import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DiaryEntry } from '@/hooks/useDiary';

interface DiaryEntryCardProps {
  entry: DiaryEntry;
  onPress?: () => void;
  onToggleFavorite?: (id: number) => Promise<void>;
}

const { width } = Dimensions.get('window');
const cardWidth = width - 40; // 20px margin on each side

export default function DiaryEntryCard({ entry, onPress, onToggleFavorite }: DiaryEntryCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getMoodIcon = (mood: string | null) => {
    if (!mood) return 'heart-outline';

    switch (mood.toLowerCase()) {
      case 'peaceful':
      case 'calm':
        return 'leaf-outline';
      case 'contemplative':
      case 'reflective':
        return 'water-outline';
      case 'cozy':
      case 'comfortable':
        return 'book-outline';
      case 'happy':
      case 'joyful':
        return 'happy-outline';
      case 'excited':
        return 'flash-outline';
      case 'grateful':
        return 'heart-outline';
      case 'energetic':
        return 'flash-outline';
      case 'hopeful':
        return 'sunny-outline';
      case 'inspired':
        return 'bulb-outline';
      default:
        return 'heart-outline';
    }
  };

  const getReadTime = (content: string) => {
    const words = content.split(' ').length;
    const readTime = Math.max(1, Math.ceil(words / 200)); // Average reading speed
    return `${readTime} min read`;
  };

  const parseEmotions = (emotions: string | null): string[] => {
    if (!emotions) return [];
    try {
      return JSON.parse(emotions);
    } catch {
      return [];
    }
  };

  const emotions = parseEmotions(entry.emotions);
  const moodIcon = getMoodIcon(entry.mood);
  const displayMood = entry.mood || 'Reflective';
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const renderCardContent = () => (
    <>
      {/* Header with mood icon and date */}
      <View style={styles.header}>
        <View style={styles.moodContainer}>
          <View style={[
            styles.moodIconContainer,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            }
          ]}>
            <Ionicons 
              name={moodIcon as any} 
              size={16} 
              color={isDark ? '#60a5fa' : '#3b82f6'} 
            />
          </View>
          <View style={styles.dateTimeContainer}>
            <Text style={[
              styles.date,
              { color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }
            ]}>
              {formatDate(entry.date)}
            </Text>
            <View style={styles.timeRow}>
              <View style={[
                styles.timeChip,
                {
                  backgroundColor: isDark ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                }
              ]}>
                <Text style={[
                  styles.time,
                  { color: isDark ? '#60a5fa' : '#3b82f6' }
                ]}>
                  {formatTime(entry.createdAt)}
                </Text>
              </View>
            </View>
            <Text style={[
              styles.mood,
              { color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }
            ]}>
              {displayMood}
              {emotions.length > 0 && ` • ${emotions.slice(0, 2).join(', ')}`}
            </Text>
          </View>
        </View>
      </View>

      {/* Title */}
      <Text style={[
        styles.title,
        { color: isDark ? '#ffffff' : '#1f2937' }
      ]}>
        {entry.title || 'Untitled Entry'}
      </Text>

      {/* Content excerpt */}
      <View style={styles.contentContainer}>
        {entry.content.split('\n').map((paragraph, index) => 
          paragraph.trim() && (
            <Text
              key={index}
              style={[
                styles.content,
                { color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)' }
              ]}
              numberOfLines={paragraph === entry.content.split('\n')[0] ? 3 : 1}
            >
              {paragraph}
            </Text>
          )
        )}
      </View>

      {/* Footer with read time and actions */}
      <View style={styles.footer}>
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onToggleFavorite?.(entry.id)}
          >
            <Ionicons 
              name={entry.isFavorite ? "heart" : "heart-outline"}
              size={16} 
              color={entry.isFavorite ? '#ef4444' : (isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)')} 
            />
          </TouchableOpacity>
        </View>
        <Text style={[
          styles.readTime,
          { color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)' }
        ]}>
          {getReadTime(entry.content)}
        </Text>
      </View>
    </>
  );

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      }
    ]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.touchable}>
        {entry.imageUrl ? (
          <ImageBackground
            source={{ uri: entry.imageUrl }}
            style={styles.backgroundImage}
            resizeMode="cover"
          >
            <BlurView
              intensity={isDark ? 85 : 80}
              style={styles.imageBlurOverlay}
              tint={isDark ? 'dark' : 'light'}
            />
            <BlurView
              intensity={isDark ? 20 : 30}
              style={styles.blurContent}
              tint={isDark ? 'dark' : 'light'}
            >
              {renderCardContent()}
            </BlurView>
          </ImageBackground>
        ) : (
          <BlurView
            intensity={isDark ? 20 : 30}
            style={styles.blurContent}
            tint={isDark ? 'dark' : 'light'}
          >
            {renderCardContent()}
          </BlurView>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    borderWidth: 1,
  },
  touchable: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  imageBlurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blurContent: {
    padding: 16,
    flex: 1,
  },
  header: {
    marginBottom: 16,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  moodIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTimeContainer: {
    flex: 1,
    gap: 4,
  },
  date: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  time: {
    fontSize: 12,
    fontWeight: '600',
  },
  mood: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 28,
  },
  contentContainer: {
    marginBottom: 16,
    gap: 8,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'justify',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
  },
  readTime: {
    fontSize: 12,
    fontWeight: '500',
  },
});
