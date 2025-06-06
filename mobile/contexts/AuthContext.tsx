import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from '../lib/auth';
import { useRouter, useSegments } from 'expo-router';

interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;
  timezone?: string | null;
  isOnboarded?: string | null;
  gender?: string | null;
  nationality?: string | null;
  languages?: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending, error, refetch } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  const refreshAuth = async () => {
    // Use better-auth's built-in refetch to refresh the session
    await refetch();
  };

  const signOut = async () => {
    try {
      const { signOut } = await import('../lib/auth');
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };
  useEffect(() => {
    console.log('Session effect - isPending:', isPending, 'session:', session, 'error:', error);
    if (!isPending) {
      if (session?.user) {
        console.log('Setting user:', session.user);
        setUser(session.user as User);
      } else {
        console.log('Clearing user');
        setUser(null);
      }
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [session, isPending, error]);
  // Handle navigation based on authentication state
  useEffect(() => {
    console.log('Navigation effect - isLoading:', isLoading, 'user:', !!user, 'segments:', segments);
    if (isLoading) return; // Don't navigate while loading

    const inAuthGroup = segments[0] === '(tabs)';
    const isAuthenticated = !!user;

    console.log('Navigation state - inAuthGroup:', inAuthGroup, 'isAuthenticated:', isAuthenticated);

    if (isAuthenticated && !inAuthGroup) {
      // User is authenticated but not in the main app, redirect to tabs
      console.log('Redirecting authenticated user to tabs');
      router.replace('/(tabs)');
    } else if (!isAuthenticated && inAuthGroup) {
      // User is not authenticated but trying to access protected routes, redirect to auth
      console.log('Redirecting unauthenticated user to auth');
      router.replace('/auth');
    }
  }, [user, segments, isLoading]);

  const value: AuthContextType = {
    user,
    isLoading: isLoading || isPending,
    isAuthenticated: !!user,
    needsOnboarding: !!user && user.isOnboarded !== "true",
    signOut,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
