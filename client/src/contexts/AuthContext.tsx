import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from '../lib/auth';

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
  };  useEffect(() => {
    if (!isPending) {
      if (session?.user) {
        setUser(session.user as User);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [session, isPending, error]);
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
