import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're not loading and not authenticated
    if (!isLoading && !isAuthenticated) {
      console.log("ProtectedRoute: Redirecting to auth");
      router.replace("/auth");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return <ActivityIndicator size="large" color="#007AFF" />;
  }

  if (!isAuthenticated) {
    // Show loading while redirect is happening
    return <ActivityIndicator size="large" color="#007AFF" />;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
