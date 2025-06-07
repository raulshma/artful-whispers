import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Share,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { Header, HeaderIconButton, Card, Button } from "@/components/ui";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";

// Mock journal entry data - replace with actual API call
const getMockJournalEntry = (id: string) => ({
  id,
  title: "A Peaceful Morning",
  content: `Today started with the most beautiful sunrise I've seen in weeks. I took a moment to sit on my balcony with my coffee and just breathe. 

There's something magical about those quiet moments before the world wakes up. The air was crisp, the birds were singing, and for a few minutes, everything felt perfectly aligned.

I've been thinking a lot about gratitude lately, and mornings like this remind me why it's so important to pause and appreciate the simple things. The warmth of the mug in my hands, the gentle breeze, the way the light slowly filled up the sky - these are the moments that make life rich.

I want to remember this feeling and carry it with me throughout the day.`,
  mood: "Peaceful",
  moodColor: "#06B6D4",
  date: "2024-01-18",
  time: "7:30 AM",
  audioUrl: null,
  tags: ["morning", "gratitude", "peaceful"],
  location: "Home",
  weather: "Sunny, 72°F",
});

export default function JournalEntryScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // In a real app, this would fetch from API based on the id
  const entry = getMockJournalEntry(id || "1");

  const handleEdit = () => {
    // Navigate to edit screen
    Alert.alert("Edit Entry", "Edit functionality coming soon!");
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this journal entry? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Delete logic here
            router.back();
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${entry.title}\n\n${entry.content}`,
        title: entry.title,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handlePlayAudio = async () => {
    if (!entry.audioUrl) return;

    try {
      if (isPlayingAudio && sound) {
        await sound.pauseAsync();
        setIsPlayingAudio(false);
      } else if (sound) {
        await sound.playAsync();
        setIsPlayingAudio(true);
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync({
          uri: entry.audioUrl,
        });
        setSound(newSound);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlayingAudio(false);
          }
        });

        await newSound.playAsync();
        setIsPlayingAudio(true);
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert("Error", "Unable to play audio");
    }
  };

  React.useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Header
        title=""
        showBackButton
        onBackPress={() => router.back()}
        rightComponent={
          <View style={styles.headerActions}>
            <HeaderIconButton
              iconName="square.and.arrow.up"
              onPress={handleShare}
            />
            <HeaderIconButton iconName="pencil" onPress={handleEdit} />
            <HeaderIconButton iconName="trash" onPress={handleDelete} />
          </View>
        }
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Entry Header */}
          <Card style={styles.headerCard}>
            <View style={styles.entryHeader}>
              <Text style={[styles.entryTitle, { color: theme.colors.text }]}>
                {entry.title}
              </Text>

              <View style={styles.metaInfo}>
                <View style={styles.dateTimeRow}>
                  <Text
                    style={[
                      styles.dateText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {entry.date}
                  </Text>
                  <Text
                    style={[
                      styles.timeText,
                      { color: theme.colors.textTertiary },
                    ]}
                  >
                    {entry.time}
                  </Text>
                </View>

                <View style={styles.moodRow}>
                  <View
                    style={[
                      styles.moodIndicator,
                      { backgroundColor: entry.moodColor },
                    ]}
                  />
                  <Text style={[styles.moodText, { color: theme.colors.text }]}>
                    {entry.mood}
                  </Text>
                </View>
              </View>
            </View>
          </Card>

          {/* Audio Player (if exists) */}
          {entry.audioUrl && (
            <Card style={styles.audioCard}>
              <View style={styles.audioPlayer}>
                <Text style={[styles.audioLabel, { color: theme.colors.text }]}>
                  Audio Recording
                </Text>
                <Button
                  title={isPlayingAudio ? "Pause" : "Play"}
                  variant="secondary"
                  onPress={handlePlayAudio}
                  style={styles.playButton}
                />
              </View>
            </Card>
          )}

          {/* Entry Content */}
          <Card style={styles.contentCard}>
            <Text style={[styles.entryContent, { color: theme.colors.text }]}>
              {entry.content}
            </Text>
          </Card>

          {/* Additional Info */}
          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Location:
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {entry.location}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Weather:
              </Text>
              <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                {entry.weather}
              </Text>
            </View>

            {entry.tags.length > 0 && (
              <View style={styles.tagsSection}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Tags:
                </Text>
                <View style={styles.tagsContainer}>
                  {entry.tags.map((tag, index) => (
                    <View
                      key={index}
                      style={[
                        styles.tag,
                        { backgroundColor: theme.colors.primary + "20" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tagText,
                          { color: theme.colors.primary },
                        ]}
                      >
                        #{tag}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerCard: {
    marginBottom: 16,
    padding: 20,
  },
  entryHeader: {
    gap: 16,
  },
  entryTitle: {
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 32,
  },
  metaInfo: {
    gap: 12,
  },
  dateTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    fontWeight: "500",
  },
  timeText: {
    fontSize: 14,
  },
  moodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  moodIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  moodText: {
    fontSize: 16,
    fontWeight: "500",
  },
  audioCard: {
    marginBottom: 16,
    padding: 16,
  },
  audioPlayer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  audioLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  playButton: {
    paddingHorizontal: 20,
  },
  contentCard: {
    marginBottom: 16,
    padding: 20,
  },
  entryContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  infoCard: {
    padding: 20,
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    minWidth: 70,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
  },
  tagsSection: {
    gap: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
