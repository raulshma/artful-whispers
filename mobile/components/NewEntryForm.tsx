import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useTheme } from "@/contexts/ThemeContext";
import { useCreateDiaryEntry } from "@/hooks/useDiary";

interface NewEntryFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

const MOOD_OPTIONS = [
  { label: "Happy", value: "happy", color: "#10B981", icon: "😊" },
  { label: "Sad", value: "sad", color: "#6B7280", icon: "😢" },
  { label: "Excited", value: "excited", color: "#F59E0B", icon: "🎉" },
  { label: "Calm", value: "calm", color: "#3B82F6", icon: "😌" },
  { label: "Anxious", value: "anxious", color: "#EF4444", icon: "😰" },
  { label: "Grateful", value: "grateful", color: "#8B5CF6", icon: "🙏" },
  { label: "Angry", value: "angry", color: "#DC2626", icon: "😠" },
  { label: "Peaceful", value: "peaceful", color: "#059669", icon: "☮️" },
];

export default function NewEntryForm({
  onCancel,
  onSuccess,
}: NewEntryFormProps) {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [selectedMood, setSelectedMood] = useState(MOOD_OPTIONS[1]); // Default to 'Sad' as shown in design
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const createEntry = useCreateDiaryEntry();
  const { theme } = useTheme();
  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert(
        "Write Something",
        "Please share your thoughts to create a reflection."
      );
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      await createEntry.mutateAsync({
        content: content.trim(),
        date: today,
      });

      Alert.alert(
        "Reflection Saved",
        "Your journal entry has been saved successfully!"
      );
      setContent("");
      setTitle("");
      onSuccess?.();
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to save your reflection. Please try again."
      );
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `Today, ${timeString}`;
  };
  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onCancel}
            disabled={createEntry.isPending}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Create New Journal
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Title Input */}
        <View style={styles.titleSection}>
          <TextInput
            style={[
              styles.titleInput,
              {
                color: theme.colors.text,
                borderBottomColor: theme.colors.border,
              },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter a title for your journal..."
            placeholderTextColor={theme.colors.textTertiary}
            maxLength={100}
          />
        </View>

        {/* Mood and Time Row */}
        <View style={styles.metaRow}>
          <TouchableOpacity
            style={[
              styles.moodSelector,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => setShowMoodSelector(true)}
          >
            <Text style={[styles.moodText, { color: selectedMood.color }]}>
              {selectedMood.icon} {selectedMood.label}
            </Text>
            <Ionicons
              name="chevron-down"
              size={16}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>

          <View
            style={[
              styles.timeContainer,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text
              style={[styles.timeText, { color: theme.colors.textSecondary }]}
            >
              {getCurrentTime()}
            </Text>
          </View>
        </View>

        {/* Content Input */}
        <View
          style={[
            styles.contentContainer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <TextInput
            style={[
              styles.contentInput,
              {
                color: theme.colors.text,
              },
            ]}
            value={content}
            onChangeText={setContent}
            placeholder="Today I had a hard time concentrating. I was very worried about making mistakes, very angry at myself for not being able to focus. The more I tried to push through, the more overwhelmed I felt. It's like my brain just wouldn't cooperate, and that made me feel even more frustrated..."
            placeholderTextColor={theme.colors.textTertiary}
            multiline
            textAlignVertical="top"
            maxLength={5000}
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: theme.colors.primary,
              opacity: !content.trim() || createEntry.isPending ? 0.5 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={createEntry.isPending || !content.trim()}
        >
          {createEntry.isPending ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="white" size="small" />
              <Text style={styles.saveButtonText}>Saving...</Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>Save Journal Entry</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Mood Selector Modal */}
      <Modal
        visible={showMoodSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMoodSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.surface,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                How are you feeling?
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowMoodSelector(false)}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.moodList}>
              {MOOD_OPTIONS.map((mood) => (
                <TouchableOpacity
                  key={mood.value}
                  style={[
                    styles.moodOption,
                    {
                      backgroundColor:
                        selectedMood.value === mood.value
                          ? mood.color + "20"
                          : "transparent",
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => {
                    setSelectedMood(mood);
                    setShowMoodSelector(false);
                  }}
                >
                  <Text style={styles.moodIcon}>{mood.icon}</Text>
                  <Text
                    style={[
                      styles.moodLabel,
                      {
                        color:
                          selectedMood.value === mood.value
                            ? mood.color
                            : theme.colors.text,
                        fontWeight:
                          selectedMood.value === mood.value ? "600" : "400",
                      },
                    ]}
                  >
                    {mood.label}
                  </Text>
                  {selectedMood.value === mood.value && (
                    <Ionicons name="checkmark" size={20} color={mood.color} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 40,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: "600",
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  metaRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  moodSelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  moodText: {
    fontSize: 14,
    fontWeight: "500",
  },
  timeContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  timeText: {
    fontSize: 14,
  },
  contentContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 300,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
    textAlignVertical: "top",
    minHeight: 280,
  },
  saveButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalCloseButton: {
    padding: 4,
  },
  moodList: {
    padding: 20,
  },
  moodOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  moodIcon: {
    fontSize: 20,
  },
  moodLabel: {
    flex: 1,
    fontSize: 16,
  },
});
