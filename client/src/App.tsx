import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, PublicRoute } from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import DiaryPage from "@/pages/diary";
import AuthPage from "@/pages/auth";
import OnboardingPage from "@/pages/onboarding";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route 
                path="/auth" 
                element={
                  <PublicRoute>
                    <AuthPage />
                  </PublicRoute>
                } 
              />
              
              {/* Protected routes */}
              <Route 
                path="/diary" 
                element={
                  <ProtectedRoute>
                    <DiaryPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/onboarding" 
                element={
                  <ProtectedRoute>
                    <OnboardingPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Redirect root to diary */}
              <Route path="/" element={<Navigate to="/diary" replace />} />
              
              {/* 404 page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
