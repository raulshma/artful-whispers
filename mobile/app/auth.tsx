import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { signIn, signUp } from '@/lib/auth';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { config } from '@/config';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { refreshAuth, isAuthenticated, user } = useAuth();

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
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </ThemedText>
        
        {/* Debug info */}
        <ThemedText style={styles.debugText}>
          Platform: {Platform.OS} | API: {config.API_BASE_URL.substring(0, 25)}...
        </ThemedText>
        
        {isSignUp && (
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        )}
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleAuth}
          disabled={isLoading}
        >
          <ThemedText style={styles.buttonText}>
            {isLoading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
          <ThemedText style={styles.switchText}>
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
  debugText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.7,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#007AFF',
  },
});
