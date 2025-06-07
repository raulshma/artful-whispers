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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useCreateDiaryEntry } from "@/hooks/useDiary";

export default function AddJournalScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [content, setContent] = useState('');
  const createEntry = useCreateDiaryEntry();

  const getCurrentTime = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `Today, ${timeString}`;
  };

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Write Something', 'Please share your thoughts to create a reflection.');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      await createEntry.mutateAsync({
        content: content.trim(),
        date: today,
      });
      
      Alert.alert('Journal Saved', 'Your journal entry has been saved successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save your journal. Please try again.');
    }
  };
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              disabled={createEntry.isPending}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Create New Journal
            </Text>
            <View style={styles.headerSpacer} />
          </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Time Display */}
          <View style={[
            styles.timeContainer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            }
          ]}>
            <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
              {getCurrentTime()}
            </Text>
          </View>

          {/* Content Input */}
          <View style={[
            styles.contentContainer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            }
          ]}>
            <TextInput
              style={[
                styles.contentInput,
                { 
                  color: theme.colors.text,
                }
              ]}
              value={content}
              onChangeText={setContent}
              placeholder="Today I had a hard time concentrating. I was very worried about making mistakes, very angry at myself for not being able to focus. The more I tried to push through, the more overwhelmed I felt. It's like my brain just wouldn't cooperate, and that made me feel even more frustrated.

By the afternoon, I decided to step away from my work for a bit. I went for a short walk outside, hoping the fresh air would help clear my head. It helped a little, but the anxiety lingered. I kept replaying scenarios in my mind where I failed or disappointed others, which made it difficult to enjoy even the small relief the walk provided.

This evening, I'm trying to be kinder to myself. I wrote down three things I managed to accomplish today, even if they were small, to remind myself that progress doesn't have to be perfect.

I'm also planning to do a short meditation session before bed to help quiet my mind. Hopefully, tomorrow will feel a little lighter."
              placeholderTextColor={theme.colors.textTertiary}
              multiline
              textAlignVertical="top"
              maxLength={5000}
              scrollEnabled={false}
              autoFocus
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: theme.colors.primary,
                opacity: (!content.trim() || createEntry.isPending) ? 0.5 : 1,
              }
            ]}
            onPress={handleSave}
            disabled={createEntry.isPending || !content.trim()}
          >
            {createEntry.isPending ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="white" size="small" />
                <Text style={styles.saveButtonText}>Saving...</Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>Save Journal Entry</Text>
            )}          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  timeContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  contentContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 400,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
    textAlignVertical: 'top',
    minHeight: 380,
  },
  saveButton: {
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
