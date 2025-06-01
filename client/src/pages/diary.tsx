import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import TimePrompt from "@/components/TimePrompt";
import NewEntryCard from "@/components/NewEntryCard";
import DiaryEntryCard from "@/components/DiaryEntryCard";
import FloatingComposeButton from "@/components/FloatingComposeButton";
import FloatingProfileButton from "@/components/FloatingProfileButton";
import InfiniteScroll from "react-infinite-scroll-component";
import type { DiaryEntry } from "@shared/schema";

export default function DiaryPage() {
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [offset, setOffset] = useState(0);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const queryClient = useQueryClient();
  const limit = 10;

  const { isLoading } = useQuery<DiaryEntry[]>({
    queryKey: ["/api/diary-entries", { limit, offset }],
    select: (data: DiaryEntry[]) => data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Use a separate effect to handle data fetching and state updates
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch(`/api/diary-entries?limit=${limit}&offset=${offset}`);
        if (!response.ok) throw new Error('Failed to fetch entries');
        
        const newEntries: DiaryEntry[] = await response.json();
        
        if (newEntries.length === 0) {
          setHasMore(false);
          return;
        }
        
        if (offset === 0) {
          // Reset entries when offset is 0 (initial load or refresh)
          setEntries(newEntries);
        } else {
          // Append new entries, avoiding duplicates
          setEntries(prevEntries => {
            const combinedEntries = [...prevEntries];
            
            newEntries.forEach((newEntry: DiaryEntry) => {
              if (!combinedEntries.some(entry => entry.id === newEntry.id)) {
                combinedEntries.push(newEntry);
              }
            });
            
            return combinedEntries;
          });
        }
      } catch (error) {
        console.error('Error fetching diary entries:', error);
      }
    };
    
    fetchEntries();
  }, [offset, limit]);

  // Check if we should show evening prompt
  useEffect(() => {
    const checkEveningPrompt = () => {
      const now = new Date();
      const hour = now.getHours();
      
      if (hour >= 20) { // After 8 PM
        const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
        const skipKey = `eveningPromptSkipped:${today}`;
        
        // Check if user already clicked "Later" today
        if (localStorage.getItem(skipKey) === 'true') {
          return;
        }
        
        // Check if there's already an entry for today
        const hasEntryToday = entries.some(entry => entry.date === today);
        
        if (!hasEntryToday) {
          setShowPrompt(true);
        }
      }
    };

    checkEveningPrompt();
  }, [entries]);

  const fetchMoreData = () => {
    if (!isLoading) {
      setOffset(prev => prev + limit);
    }
  };

  const handleStartNewEntry = () => {
    setShowPrompt(false);
    setShowNewEntry(true);
  };

  const handleEntryCreated = () => {
    setShowNewEntry(false);
    // Reset offset and entries, then refetch
    setOffset(0);
    setEntries([]);
    setHasMore(true);
    queryClient.invalidateQueries({ queryKey: ["/api/diary-entries"] });
  };

  // Derive background image URL
  const today = new Date().toISOString().split('T')[0];
  const bgImageUrl = entries.find(e => e.date === today)?.imageUrl 
                    || entries[0]?.imageUrl 
                    || null;

  return (
    <div 
      className="min-h-screen bg-background bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: bgImageUrl ? `url(${bgImageUrl})` : undefined
      }}
    >
      {/* Semi-transparent overlay for better content legibility */}
      {bgImageUrl && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm pointer-events-none" />
      )}
      {/* Floating Profile Button */}
      <FloatingProfileButton />

      {/* Time Prompt */}
      {showPrompt && (
        <TimePrompt
          onStartEntry={handleStartNewEntry}
          onClose={() => {
            const today = new Date().toISOString().split('T')[0];
            const skipKey = `eveningPromptSkipped:${today}`;
            localStorage.setItem(skipKey, 'true');
            setShowPrompt(false);
          }}
        />
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 relative z-10">
        {/* New Entry Card */}
        {showNewEntry && (
          <NewEntryCard
            onEntryCreated={handleEntryCreated}
            onCancel={() => setShowNewEntry(false)}
          />
        )}

        {/* Diary Entries with Infinite Scroll */}
        <InfiniteScroll
          dataLength={entries.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={
            <div className="text-center py-8">
              <div className="inline-flex items-center space-x-2 text-text-blue/60">
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0.1s]"></div>
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <span className="font-inter text-sm ml-3">Loading more reflections...</span>
              </div>
            </div>
          }
          endMessage={
            <div className="text-center py-8 text-text-blue/60">
              <p className="font-inter text-sm">You've reached the end of your journal entries</p>
            </div>
          }
          scrollThreshold={0.9}
        >
          <div className="space-y-12">
            {entries.map((entry) => (
              <DiaryEntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        </InfiniteScroll>
      </main>

      {/* Floating Compose Button */}
      <FloatingComposeButton onClick={() => setShowNewEntry(true)} />
    </div>
  );
}
