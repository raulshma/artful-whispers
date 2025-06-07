import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text
} from 'react-native';
import { signIn, signUp } from '@/lib/auth';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { config } from '@/config';
import {
  Button,
  Input,
  Card,
  LoadingAnimation
} from '@/components/ui';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { refreshAuth, isAuthenticated, user } = useAuth();
  const { theme } = useTheme();

  // Debug effect to log platform and config info
  useEffect(() => {
    console.log('🐛 Auth Screen Debug Info:');
    console.log('Platform:', Platform.OS);
    console.log('API Base URL:', config.API_BASE_URL);
    console.log('Is Authenticated:', isAuthenticated);
    console.log('User:', user);
  }, [isAuthenticated, user]);

  const handleAuth = async () => {
    if (!email || !password || (isSignUp && !name)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    console.log('🔐 Starting authentication process...');
    console.log('Platform:', Platform.OS);
    console.log('API URL:', config.API_BASE_URL);

    setIsLoading(true);
    try {
      if (isSignUp) {
        console.log('Attempting sign up...');
        await signUp.email({
          email,
          password,
          name,
        });
        Alert.alert('Success', 'Account created successfully!');
        // Don't navigate immediately for sign up, let user sign in
      } else {
        console.log('Attempting sign in...');
        const result = await signIn.email({
          email,
          password,
        });
        console.log('Sign in successful:', result);
        
        // Force refresh the auth context to get the updated session
        console.log('Refreshing auth context...');
        await refreshAuth();
        
        // Small delay to ensure session is updated
        setTimeout(() => {
          console.log('Auth refresh completed, context should handle navigation');
        }, 100);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={[styles.logoCircle, { backgroundColor: theme.colors.primary + '20' }]}>
                <IconSymbol
                  name="heart.text.square.fill"
                  size={40}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={[styles.appName, { color: theme.colors.text }]}>
                Artful Whispers
              </Text>
              <Text style={[styles.tagline, { color: theme.colors.textSecondary }]}>
                Your digital companion for mindful reflection
              </Text>
            </View>
          </View>

          {/* Auth Form */}
          <Card style={styles.formCard}>
            <Text style={[styles.formTitle, { color: theme.colors.text }]}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>
            
            <Text style={[styles.formSubtitle, { color: theme.colors.textSecondary }]}>
              {isSignUp
                ? 'Start your journey of self-discovery'
                : 'Continue your mindfulness journey'
              }
            </Text>

            <View style={styles.formFields}>
              {isSignUp && (
                <Input
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  leftIcon={
                    <IconSymbol
                      name="person.fill"
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  }
                />
              )}
              
              <Input
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={
                  <IconSymbol
                    name="envelope.fill"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                }
              />
              
              <Input
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                leftIcon={
                  <IconSymbol
                    name="lock.fill"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                }
              />

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <LoadingAnimation variant="dots" size={24} />
                  <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                    {isSignUp ? 'Creating your account...' : 'Signing you in...'}
                  </Text>
                </View>
              ) : (
                <Button
                  title={isSignUp ? 'Create Account' : 'Sign In'}
                  variant="primary"
                  onPress={handleAuth}
                  style={styles.authButton}
                />
              )}

              <Button
                title={isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                variant="link"
                onPress={() => setIsSignUp(!isSignUp)}
                style={styles.switchButton}
              />
            </View>
          </Card>

          {/* Debug Info (can be removed in production) */}
          {__DEV__ && (
            <View style={styles.debugContainer}>
              <Text style={[styles.debugText, { color: theme.colors.textTertiary }]}>
                Platform: {Platform.OS} | API: {config.API_BASE_URL.substring(0, 30)}...
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    gap: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 280,
  },
  formCard: {
    padding: 32,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  formFields: {
    gap: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
  },
  authButton: {
    marginTop: 8,
  },
  switchButton: {
    marginTop: 8,
  },
  debugContainer: {
    padding: 16,
    alignItems: 'center',
  },
  debugText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
