import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { DiaryEntry } from '@/hooks/useDiary';

interface DiaryEntryCardProps {
  entry: DiaryEntry;
  onPress?: () => void;
}

const { width } = Dimensions.get('window');
const cardWidth = width - 40; // 20px margin on each side

export default function DiaryEntryCard({ entry, onPress }: DiaryEntryCardProps) {
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

  const getMoodEmoji = (mood: string | null) => {
    if (!mood) return '💭';
    
    const moodEmojis: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      excited: '🎉',
      calm: '😌',
      anxious: '😰',
      angry: '😠',
      grateful: '🙏',
      confused: '😕',
      peaceful: '🕊️',
      energetic: '⚡',
      tired: '😴',
      hopeful: '🌟',
      nostalgic: '🌅',
      content: '😌',
      frustrated: '😤',
      inspired: '💡',
      melancholy: '🌧️',
      joyful: '✨',
      reflective: '🤔',
      motivated: '🔥',
    };
    
    return moodEmojis[mood.toLowerCase()] || '💭';
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

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {entry.imageUrl && (
        <Image source={{ uri: entry.imageUrl }} style={styles.image} />
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {entry.title || 'Untitled Entry'}
            </Text>
            {entry.mood && (
              <Text style={styles.moodEmoji}>
                {getMoodEmoji(entry.mood)}
              </Text>
            )}
          </View>
          
          <View style={styles.dateContainer}>
            <Text style={styles.date}>{formatDate(entry.createdAt)}</Text>
            <Text style={styles.time}>{formatTime(entry.createdAt)}</Text>
          </View>
        </View>

        <Text style={styles.excerpt} numberOfLines={3}>
          {entry.content}
        </Text>

        {emotions.length > 0 && (
          <View style={styles.emotionsContainer}>
            {emotions.slice(0, 3).map((emotion, index) => (
              <View key={index} style={styles.emotionTag}>
                <Text style={styles.emotionText}>
                  {emotion}
                </Text>
              </View>
            ))}
            {emotions.length > 3 && (
              <Text style={styles.moreEmotions}>
                +{emotions.length - 3} more
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  moodEmoji: {
    fontSize: 20,
    marginLeft: 8,
  },
  dateContainer: {
    alignItems: 'flex-end',
  },
  date: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  time: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  excerpt: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  emotionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  emotionTag: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e0f2fe',
  },
  emotionText: {
    fontSize: 11,
    color: '#0369a1',
    fontWeight: '500',
  },
  moreEmotions: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
});
