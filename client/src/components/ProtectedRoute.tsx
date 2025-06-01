import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({ children, requireOnboarding = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, needsOnboarding } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // If user needs onboarding and is not on the onboarding page, redirect to onboarding
  if (needsOnboarding && location.pathname !== "/onboarding" && !requireOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // If user doesn't need onboarding and is on the onboarding page, redirect to diary
  if (!needsOnboarding && location.pathname === "/onboarding") {
    return <Navigate to="/diary" replace />;
  }

  return <>{children}</>;
}

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function PublicRoute({ children, redirectTo }: PublicRouteProps) {
  const { isAuthenticated, isLoading, needsOnboarding } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // If user needs onboarding, redirect to onboarding, otherwise to the specified page
    const destination = needsOnboarding ? '/onboarding' : (redirectTo || '/diary');
    return <Navigate to={destination} replace />;
  }

  return <>{children}</>;
}
