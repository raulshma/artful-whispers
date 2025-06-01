import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, Settings, Search, Feather } from "lucide-react";
import TimePrompt from "@/components/TimePrompt";
import NewEntryCard from "@/components/NewEntryCard";
import DiaryEntryCard from "@/components/DiaryEntryCard";
import FloatingComposeButton from "@/components/FloatingComposeButton";
import type { DiaryEntry } from "@shared/schema";

export default function DiaryPage() {
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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                <Feather className="text-text-blue text-sm" size={16} />
              </div>
              <h1 className="font-crimson text-xl font-semibold text-text-blue">Daily Reflections</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="text-text-blue/70 hover:text-text-blue transition-colors">
                <Search size={18} />
              </button>
              <button className="text-text-blue/70 hover:text-text-blue transition-colors">
                <Settings size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Time Prompt */}
      {showPrompt && (
        <TimePrompt
          onStartEntry={handleStartNewEntry}
          onClose={() => setShowPrompt(false)}
        />
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
