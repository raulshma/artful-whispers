import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useCreateDiaryEntry } from "@/hooks/useDiary";
import { LinearGradient } from "expo-linear-gradient";

export default function AddJournalScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const createEntry = useCreateDiaryEntry();
  const saveButtonScale = React.useRef(new Animated.Value(1)).current;

  const getCurrentTime = () => {
    const now = new Date();
    // Get a more friendly date format
    const dateString = now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const timeString = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return { date: dateString, time: timeString };
  };
  const handleContentChange = (text: string) => {
    setContent(text);
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
  };

  const getCharacterCount = () => content.length;
  const getCharacterColor = () => {
    const count = getCharacterCount();
    if (count > 4500) return theme.colors.semantic.error;
    if (count > 4000) return theme.colors.semantic.warning;
    return theme.colors.textTertiary;
  };
  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert(
        "Share Your Thoughts",
        "Please write something to create your journal entry."
      );
      return;
    }

    // Animate button press
    Animated.sequence([
      Animated.timing(saveButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(saveButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const today = new Date().toISOString().split("T")[0];
      await createEntry.mutateAsync({
        content: content.trim(),
        date: today,
      });

      Alert.alert(
        "✨ Journal Saved",
        "Your thoughts have been captured beautifully!",
        [{ text: "Continue Writing", onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert(
        "Oops!",
        error.message || "Something went wrong while saving. Please try again."
      );
    }
  };

  const { date, time } = getCurrentTime();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          {/* Enhanced Header with Gradient */}
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.header}>
              <TouchableOpacity
                style={[
                  styles.backButton,
                  { backgroundColor: "rgba(255,255,255,0.2)" },
                ]}
                onPress={() => router.back()}
                disabled={createEntry.isPending}
              >
                <Ionicons name="arrow-back" size={22} color="white" />
              </TouchableOpacity>
              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>New Journal Entry</Text>
                <Text style={styles.headerSubtitle}>Share your thoughts</Text>
              </View>
              <View style={styles.headerSpacer} />
            </View>
          </LinearGradient>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Enhanced Time Display */}
            <View style={styles.timeSection}>
              <View
                style={[
                  styles.timeContainer,
                  {
                    backgroundColor: theme.colors.backgroundGreen,
                    ...theme.shadows.sm,
                  },
                ]}
              >
                <View style={styles.timeContent}>
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={theme.colors.primary}
                  />
                  <View style={styles.timeTextContainer}>
                    <Text
                      style={[styles.dateText, { color: theme.colors.text }]}
                    >
                      {date}
                    </Text>
                    <Text
                      style={[
                        styles.timeText,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      {time}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            {/* Enhanced Content Input */}
            <View style={styles.contentSection}>
              <View
                style={[
                  styles.contentContainer,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: content.trim()
                      ? theme.colors.primary
                      : theme.colors.border,
                    ...theme.shadows.md,
                  },
                ]}
              >
                <View style={styles.contentHeader}>
                  <View style={styles.contentTitleContainer}>
                    <Ionicons
                      name="create-outline"
                      size={18}
                      color={theme.colors.primary}
                    />
                    <Text
                      style={[
                        styles.contentTitle,
                        { color: theme.colors.text },
                      ]}
                    >
                      What's on your mind?
                    </Text>
                  </View>
                  <View style={styles.contentStats}>
                    <Text
                      style={[
                        styles.wordCount,
                        { color: theme.colors.textTertiary },
                      ]}
                    >
                      {wordCount} words
                    </Text>
                    <Text
                      style={[styles.charCount, { color: getCharacterColor() }]}
                    >
                      {getCharacterCount()}/5000
                    </Text>
                  </View>
                </View>
                <TextInput
                  style={[
                    styles.contentInput,
                    {
                      color: theme.colors.text,
                    },
                  ]}
                  value={content}
                  onChangeText={handleContentChange}
                  placeholder="How are you feeling today? What's been on your mind?

Share your thoughts, experiences, or reflections. This is your personal space to express yourself freely and without judgment.

• What made you smile today?
• Any challenges you faced?
• Something you're grateful for?
• Goals or hopes for tomorrow?

Take your time... there's no rush. 💚"
                  placeholderTextColor={theme.colors.textTertiary}
                  multiline
                  textAlignVertical="top"
                  maxLength={5000}
                  scrollEnabled={false}
                  autoFocus
                />
              </View>
            </View>
            {/* Enhanced Save Button */}
            <View style={styles.saveSection}>
              <Animated.View
                style={{ transform: [{ scale: saveButtonScale }] }}
              >
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    {
                      opacity:
                        !content.trim() || createEntry.isPending ? 0.6 : 1,
                    },
                  ]}
                  onPress={handleSave}
                  disabled={createEntry.isPending || !content.trim()}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveButtonGradient}
                  >
                    {createEntry.isPending ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator color="white" size="small" />
                        <Text style={styles.saveButtonText}>
                          Saving your thoughts...
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.saveButtonContent}>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="white"
                        />
                        <Text style={styles.saveButtonText}>
                          Save Journal Entry
                        </Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Helpful tip */}
              <Text
                style={[styles.tipText, { color: theme.colors.textTertiary }]}
              >
                💡 Your entries are private and secure. Take your time to
                express yourself.
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },

  // Enhanced Header Styles
  headerGradient: {
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  headerSpacer: {
    width: 40,
  },

  scrollView: {
    flex: 1,
  },

  // Enhanced Time Section
  timeSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  timeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  timeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeTextContainer: {
    marginLeft: 10,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  timeText: {
    fontSize: 13,
    fontWeight: "500",
  },

  // Enhanced Content Section
  contentSection: {
    paddingHorizontal: 20,
    flex: 1,
  },
  contentContainer: {
    borderRadius: 20,
    borderWidth: 2,
    minHeight: 360,
    flex: 1,
  },
  contentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
  },
  contentTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  contentStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  wordCount: {
    fontSize: 12,
    fontWeight: "500",
  },
  charCount: {
    fontSize: 12,
    fontWeight: "500",
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 18,
    paddingBottom: 18,
    textAlignVertical: "top",
    minHeight: 300,
    fontWeight: "400",
  },

  // Enhanced Save Section
  saveSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 30,
  },
  saveButton: {
    borderRadius: 16,
    marginBottom: 16,
  },
  saveButtonGradient: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tipText: {
    fontSize: 13,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 18,
  },
});
