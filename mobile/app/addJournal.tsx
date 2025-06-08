import React, { useState, useRef } from "react";
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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useCreateDiaryEntry } from "@/hooks/useDiary";
import { Spacing } from "@/constants/Spacing";
import * as Haptics from "expo-haptics";

export default function AddJournalScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const createEntry = useCreateDiaryEntry();
  const contentInputRef = useRef<TextInput>(null);

  const getCurrentTime = () => {
    const now = new Date();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    let dateLabel;
    if (now.toDateString() === today.toDateString()) {
      dateLabel = "Today";
    } else if (now.toDateString() === yesterday.toDateString()) {
      dateLabel = "Yesterday";
    } else {
      dateLabel = now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    const timeString = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return { date: dateLabel, time: timeString };
  };

  const handleContentChange = (text: string) => {
    setContent(text);
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
  };

  const getReadingTime = () => {
    if (wordCount === 0) return "0 min read";
    const readTime = Math.max(1, Math.ceil(wordCount / 200));
    return `${readTime} min read`;
  };

  const handleSave = async () => {
    if (!content.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        "Empty Entry",
        "Please write something before saving your journal entry."
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const today = new Date().toISOString().split("T")[0];
      await createEntry.mutateAsync({
        content: content.trim(),
        date: today,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Save Failed",
        error.message || "Could not save your entry. Please try again."
      );
    }
  };
  const handleDiscard = () => {
    if (content.trim()) {
      Alert.alert(
        "Discard Entry?",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          { text: "Keep Writing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const { date, time } = getCurrentTime();
  const hasContent = content.trim().length > 0;

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
          {/* Minimal Header */}
          <View
            style={[styles.header, { borderBottomColor: theme.colors.border }]}
          >
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleDiscard}
              disabled={createEntry.isPending}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={[styles.headerDate, { color: theme.colors.text }]}>
                {date}
              </Text>
              <Text
                style={[
                  styles.headerTime,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {time}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.saveButton,
                {
                  backgroundColor: hasContent
                    ? theme.colors.primary
                    : theme.colors.backgroundSecondary,
                },
              ]}
              onPress={handleSave}
              disabled={createEntry.isPending || !hasContent}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {createEntry.isPending ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.background}
                />
              ) : (
                <Text
                  style={[
                    styles.saveButtonText,
                    {
                      color: hasContent
                        ? theme.colors.background
                        : theme.colors.textTertiary,
                    },
                  ]}
                >
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Content Input */}
            <TextInput
              ref={contentInputRef}
              style={[styles.contentInput, { color: theme.colors.text }]}
              value={content}
              onChangeText={handleContentChange}
              placeholder="What's on your mind today?

Share your thoughts, experiences, or feelings. This is your space to reflect and express yourself freely."
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              textAlignVertical="top"
              maxLength={5000}
              scrollEnabled={false}
              autoFocus
            />

            {/* Bottom Spacing for Keyboard */}
            <View style={styles.bottomSpacing} />
          </ScrollView>
          {/* Stats Footer */}
          {hasContent && (
            <View
              style={[
                styles.statsFooter,
                {
                  backgroundColor: theme.colors.background,
                  borderTopColor: theme.colors.border,
                },
              ]}
            >
              <Text
                style={[styles.statsText, { color: theme.colors.textTertiary }]}
              >
                {wordCount} words • {getReadingTime()}
              </Text>
            </View>
          )}
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
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerButton: {
    padding: Spacing.xs,
  },
  headerCenter: {
    alignItems: "center",
  },
  headerDate: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  headerTime: {
    fontSize: 12,
    fontWeight: "500",
  },
  saveButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl * 2,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
    minHeight: 400,
    textAlignVertical: "top",
  },
  bottomSpacing: {
    height: 100,
  },
  // Stats Footer
  statsFooter: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statsText: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
});
