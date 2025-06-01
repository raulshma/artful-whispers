import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import TimePrompt from "@/components/TimePrompt";
import NewEntryCard from "@/components/NewEntryCard";
import DiaryEntryCard from "@/components/DiaryEntryCard";
import FloatingComposeButton from "@/components/FloatingComposeButton";
import FloatingProfileButton from "@/components/FloatingProfileButton";
import type { DiaryEntry } from "@shared/schema";

export default function DiaryPage() {
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 10;

  const { data: entries = [], isLoading, refetch } = useQuery<DiaryEntry[]>({
    queryKey: ["/api/diary-entries", { limit, offset }],
  });

  // Check if we should show evening prompt
  useEffect(() => {
    const checkEveningPrompt = () => {
      const now = new Date();
      const hour = now.getHours();
      
      if (hour >= 20) { // After 8 PM
        const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Check if there's already an entry for today
        const hasEntryToday = entries.some(entry => entry.date === today);
        
        if (!hasEntryToday) {
          setShowPrompt(true);
        }
      }
    };

    checkEveningPrompt();
  }, [entries]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      
      if (scrollTop + windowHeight >= docHeight - 1000) {
        setOffset(prev => prev + limit);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartNewEntry = () => {
    setShowPrompt(false);
    setShowNewEntry(true);
  };

  const handleEntryCreated = () => {
    setShowNewEntry(false);
    refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Floating Profile Button */}
      <FloatingProfileButton />

      {/* Time Prompt */}
      {showPrompt && (
        <TimePrompt
          onStartEntry={handleStartNewEntry}
          onClose={() => setShowPrompt(false)}
        />
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16">


        {/* New Entry Card */}
        {showNewEntry && (
          <NewEntryCard
            onEntryCreated={handleEntryCreated}
            onCancel={() => setShowNewEntry(false)}
          />
        )}

        {/* Diary Entries */}
        <div className="space-y-12">
          {entries.map((entry) => (
            <DiaryEntryCard key={entry.id} entry={entry} />
          ))}
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center space-x-2 text-text-blue/60">
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0.1s]"></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <span className="font-inter text-sm ml-3">Loading more reflections...</span>
            </div>
          </div>
        )}
      </main>

      {/* Floating Compose Button */}
      <FloatingComposeButton onClick={() => setShowNewEntry(true)} />
    </div>
  );
}
