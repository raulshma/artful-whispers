import { createAuthClient } from "better-auth/react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '@/config';

export const authClient = createAuthClient({
  baseURL: config.API_BASE_URL,
  storage: AsyncStorage, // Use AsyncStorage for React Native
});

export const { 
  signIn, 
  signUp, 
  signOut, 
  useSession, 
  getSession 
} = authClient;
