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
import * as Haptics from "expo-haptics";

export default function AddJournalScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
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
      // Provide gentle haptic feedback for validation error
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        "Share Your Thoughts",
        "Please write something to create your journal entry."
      );
      return;
    }

    // Provide success haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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

      // Success haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        "✨ Journal Saved",
        "Your thoughts have been captured beautifully!",
        [{ text: "Continue Writing", onPress: () => router.back() }]
      );
    } catch (error: any) {
      // Error haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Oops!",
        error.message || "Something went wrong while saving. Please try again."
      );
    }
  };

  const { date, time } = getCurrentTime();
  return (
    <View style={styles.container}>
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
                style={styles.backButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.back();
                }}
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
            keyboardShouldPersistTaps="handled"
          >
            {/* Enhanced Time Display */}
            <View style={styles.timeSection}>
              <View style={styles.timeContainer}>
                <View style={styles.timeContent}>
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={theme.colors.primary}
                  />
                  <View style={styles.timeTextContainer}>
                    <Text style={styles.dateText}>{date}</Text>
                    <Text style={styles.timeText}>{time}</Text>
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
                    borderColor: content.trim()
                      ? theme.colors.primary
                      : theme.colors.border,
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
                    <Text style={styles.contentTitle}>
                      What's on your mind?
                    </Text>
                  </View>
                  <View style={styles.contentStats}>
                    <Text style={styles.wordCount}>{wordCount} words</Text>
                    <Text
                      style={[styles.charCount, { color: getCharacterColor() }]}
                    >
                      {getCharacterCount()}/5000
                    </Text>
                  </View>
                </View>
                <TextInput
                  style={styles.contentInput}
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
              <Text style={styles.tipText}>
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

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    safeArea: {
      flex: 1,
    },
    keyboardContainer: {
      flex: 1,
    },
    // Header
    headerGradient: {
      paddingBottom: theme.spacing.lg,
      borderBottomLeftRadius: theme.borderRadius["2xl"],
      borderBottomRightRadius: theme.borderRadius["2xl"],
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xs,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.xl,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.2)",
    },
    headerContent: {
      flex: 1,
      alignItems: "center",
    },
    headerTitle: {
      ...theme.typography.h4,
      color: "white",
      marginBottom: 2,
    },
    headerSubtitle: {
      ...theme.typography.caption,
      color: "rgba(255,255,255,0.8)",
    },
    headerSpacer: {
      width: 40,
    },
    // Content
    scrollView: {
      flex: 1,
    },
    timeSection: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing["2xl"],
      paddingBottom: theme.spacing.md,
    },
    timeContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
      alignSelf: "flex-start",
      backgroundColor: theme.colors.backgroundGreen,
      ...theme.shadows.sm,
    },
    timeContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    timeTextContainer: {
      marginLeft: theme.spacing.sm,
    },
    dateText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.text,
      marginBottom: 2,
    },
    timeText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    // Content Section
    contentSection: {
      paddingHorizontal: theme.spacing.lg,
      flex: 1,
    },
    contentContainer: {
      borderRadius: theme.borderRadius.xl,
      borderWidth: 2,
      borderColor: theme.colors.border,
      minHeight: 360,
      flex: 1,
      backgroundColor: theme.colors.surface,
      ...theme.shadows.md,
    },
    contentHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    contentTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    contentTitle: {
      ...theme.typography.bodyMedium,
      color: theme.colors.text,
      marginLeft: theme.spacing.sm,
    },
    contentStats: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
    },
    wordCount: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
    },
    charCount: {
      ...theme.typography.caption,
    },
    contentInput: {
      ...theme.typography.body,
      color: theme.colors.text,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      textAlignVertical: "top",
      minHeight: 300,
    },
    // Save Section
    saveSection: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing["2xl"],
      paddingBottom: theme.spacing.xl,
    },
    saveButton: {
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.md,
      ...theme.shadows.md,
    },
    saveButtonGradient: {
      paddingVertical: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      alignItems: "center",
      justifyContent: "center",
    },
    saveButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    saveButtonText: {
      ...theme.typography.bodyMedium,
      fontWeight: "700",
      color: "white",
    },
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    tipText: {
      ...theme.typography.caption,
      color: theme.colors.textTertiary,
      textAlign: "center",
      lineHeight: 18,
    },
  });
