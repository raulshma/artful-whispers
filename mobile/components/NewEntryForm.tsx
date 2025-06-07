import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/contexts/ThemeContext';
import { useCreateDiaryEntry } from '@/hooks/useDiary';

interface NewEntryFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

export default function NewEntryForm({ onCancel, onSuccess }: NewEntryFormProps) {
  const [content, setContent] = useState('');
  const createEntry = useCreateDiaryEntry();
  const { theme } = useTheme();

  const handleSubmit = async () => {
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
      
      Alert.alert('Reflection Saved', 'AI is creating your title and artwork...');
      setContent('');
      onSuccess?.();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save your reflection. Please try again.');
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.backgroundSecondary,
        }
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Card Container with Blur Effect */}
        <View style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }
        ]}>
          <BlurView
            intensity={20}
            style={styles.blurContent}
            tint={theme.isDark ? 'dark' : 'light'}
          >
            {/* Header with Icon */}
            <View style={styles.header}>
              <View style={styles.headerRow}>
                <View style={[
                  styles.iconContainer,
                  {
                    backgroundColor: theme.colors.backgroundGreen,
                  }
                ]}>
                  <Ionicons 
                    name="create-outline" 
                    size={20} 
                    color={theme.colors.primary} 
                  />
                </View>
                <View style={styles.headerText}>
                  <Text style={[
                    styles.title,
                    { color: theme.colors.text }
                  ]}>
                    New Journal Entry
                  </Text>
                  <Text style={[
                    styles.subtitle,
                    { color: theme.colors.textSecondary }
                  ]}>
                    {currentDate} • Capture your thoughts and feelings
                  </Text>
                </View>
              </View>
            </View>

            {/* Input Container */}
            <View style={[
              styles.inputContainer,
              {
                backgroundColor: theme.colors.backgroundTertiary,
                borderColor: theme.colors.border,
              }
            ]}>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    color: theme.colors.text,
                    backgroundColor: 'transparent',
                  }
                ]}
                value={content}
                onChangeText={setContent}
                placeholder="How are you feeling today? What&apos;s on your mind? Take a moment to reflect on your day..."
                placeholderTextColor={theme.colors.textTertiary}
                multiline
                textAlignVertical="top"
                numberOfLines={12}
                maxLength={5000}
              />
            </View>

            {/* AI Message */}
            <View style={styles.aiMessage}>
              <View style={[
                styles.aiIndicator,
                {
                  backgroundColor: theme.colors.accent,
                }
              ]} />
              <Text style={[
                styles.aiText,
                { color: theme.colors.textSecondary }
              ]}>
                AI will craft a beautiful title and artwork
              </Text>
            </View>

            {/* Button Container */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.cancelButton,
                  {
                    backgroundColor: 'transparent',
                    borderColor: theme.colors.border,
                  }
                ]}
                onPress={onCancel}
                disabled={createEntry.isPending}
              >
                <Text style={[
                  styles.cancelButtonText,
                  { color: theme.colors.textSecondary }
                ]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.saveButton,
                  {
                    backgroundColor: theme.colors.primary,
                    opacity: (!content.trim() || createEntry.isPending) ? 0.5 : 1,
                  }
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
                  <Text style={styles.saveButtonText}>Save Entry</Text>
                )}
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  card: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 20,
  },
  blurContent: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    minHeight: 240,
  },
  textInput: {
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: 'top',
    flex: 1,
    minHeight: 200,
  },
  aiMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  aiIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  aiText: {
    fontSize: 12,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    shadowColor: '#8DB596',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
