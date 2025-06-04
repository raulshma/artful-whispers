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
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCreateDiaryEntry } from '@/hooks/useDiary';
import { useRouter } from 'expo-router';

interface NewEntryFormProps {
  onCancel: () => void;
  onSuccess?: () => void;
}

export default function NewEntryForm({ onCancel, onSuccess }: NewEntryFormProps) {
  const [content, setContent] = useState('');
  const router = useRouter();
  const createEntry = useCreateDiaryEntry();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
          backgroundColor: isDark ? '#0f172a' : '#fafafa',
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
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          }
        ]}>
          <BlurView
            intensity={isDark ? 20 : 30}
            style={styles.blurContent}
            tint={isDark ? 'dark' : 'light'}
          >
            {/* Header with Icon */}
            <View style={styles.header}>
              <View style={styles.headerRow}>
                <View style={[
                  styles.iconContainer,
                  {
                    backgroundColor: isDark ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                  }
                ]}>
                  <Ionicons 
                    name="create-outline" 
                    size={20} 
                    color={isDark ? '#60a5fa' : '#3b82f6'} 
                  />
                </View>
                <View style={styles.headerText}>
                  <Text style={[
                    styles.title,
                    { color: isDark ? '#ffffff' : '#1f2937' }
                  ]}>
                    New Reflection
                  </Text>
                  <Text style={[
                    styles.subtitle,
                    { color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }
                  ]}>
                    {currentDate} • You can create multiple reflections each day
                  </Text>
                </View>
              </View>
            </View>

            {/* Input Container */}
            <View style={[
              styles.inputContainer,
              {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              }
            ]}>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    color: isDark ? '#ffffff' : '#1f2937',
                    backgroundColor: 'transparent',
                  }
                ]}
                value={content}
                onChangeText={setContent}
                placeholder="What's on your mind right now? Capture this moment - you can write as many reflections as you'd like throughout the day..."
                placeholderTextColor={isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'}
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
                  backgroundColor: isDark ? '#60a5fa' : '#3b82f6',
                }
              ]} />
              <Text style={[
                styles.aiText,
                { color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }
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
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  }
                ]}
                onPress={onCancel}
                disabled={createEntry.isPending}
              >
                <Text style={[
                  styles.cancelButtonText,
                  { color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)' }
                ]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.saveButton,
                  {
                    backgroundColor: isDark ? '#60a5fa' : '#3b82f6',
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
                  <Text style={styles.saveButtonText}>Save Reflection</Text>
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
    shadowColor: '#3b82f6',
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
