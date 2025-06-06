import { createAuthClient } from "better-auth/react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { config } from '@/config';

// Create a storage adapter that works on both web and mobile
const getStorage = () => {
  if (Platform.OS === 'web') {
    // For web, create a localStorage adapter that matches AsyncStorage interface
    return {
      getItem: async (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch {
          // Handle storage errors silently
        }
      },
      removeItem: async (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch {
          // Handle storage errors silently
        }
      },
    };
  }
  return AsyncStorage;
};

export const authClient = createAuthClient({
  baseURL: config.API_BASE_URL,
  storage: getStorage(),
});

export const { 
  signIn, 
  signUp, 
  signOut, 
  useSession, 
  getSession 
} = authClient;
