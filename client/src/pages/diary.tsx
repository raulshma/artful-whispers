import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import TimePrompt from "@/components/TimePrompt";
import NewEntryCard from "@/components/NewEntryCard";
import DiaryEntryCard from "@/components/DiaryEntryCard";
import FloatingComposeButton from "@/components/FloatingComposeButton";
import FloatingProfileButton from "@/components/FloatingProfileButton";
import FloatingThemeToggle from "@/components/FloatingThemeToggle";
import DiaryBackground from "@/components/DiaryBackground";
import InfiniteScroll from "react-infinite-scroll-component";
import type { DiaryEntry } from "@shared/schema";

export default function DiaryPage() {
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [currentBgImage, setCurrentBgImage] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const entryRefs = useRef<Record<string, HTMLDivElement>>({});
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
        
        // Check if there's been any entry activity today (show prompt regardless of existing entries)
        // This allows users to add multiple entries per day
        const lastEntryTime = localStorage.getItem(`lastEntryTime:${today}`);
        const now = Date.now();
        const twoHoursAgo = now - (2 * 60 * 60 * 1000); // 2 hours in milliseconds
        
        // Show prompt if no entry was created in the last 2 hours
        if (!lastEntryTime || parseInt(lastEntryTime) < twoHoursAgo) {
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
    
    // Track when an entry was created for prompt logic
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`lastEntryTime:${today}`, Date.now().toString());
    
    // Reset offset and entries, then refetch
    setOffset(0);
    setEntries([]);
    setHasMore(true);
    queryClient.invalidateQueries({ queryKey: ["/api/diary-entries"] });
  };

  // Set initial background image when entries change
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const bgImageUrl = entries.find(e => e.date === today)?.imageUrl 
                      || entries[0]?.imageUrl 
                      || null;
    setCurrentBgImage(bgImageUrl);
  }, [entries]);

  // Intersection observer to update background based on visible entry
  useEffect(() => {
    const callback = (entries: IntersectionObserverEntry[]) => {
      const visibleEntry = entries.find(entry => entry.intersectionRatio >= 0.5);
      if (visibleEntry) {
        const imageUrl = (visibleEntry.target as HTMLElement).dataset.imageUrl;
        const newUrl = imageUrl || null;
        setCurrentBgImage(prev => prev !== newUrl ? newUrl : prev);
      }
    };

    const observer = new IntersectionObserver(callback, { threshold: 0.5 });

    Object.values(entryRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [entries]);  return (
    <div className="min-h-screen bg-background mobile-safe-area">
      <DiaryBackground imageUrl={currentBgImage} />
      
      {/* Floating Profile Button */}
      <FloatingProfileButton />

      {/* Floating Theme Toggle */}
      <FloatingThemeToggle />

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
      )}        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pt-12 sm:pt-16 relative z-10 mobile-scroll">
          {/* New Entry Card */}
          {showNewEntry && (
            <NewEntryCard
              onEntryCreated={handleEntryCreated}
              onCancel={() => setShowNewEntry(false)}
            />
          )}          {/* Helpful message for multiple entries */}
          {entries.length === 0 && !showNewEntry && (
            <div className="text-center py-8 sm:py-12 mb-6 sm:mb-8">
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-border/30">
                <h3 className="font-crimson text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                  Welcome to Your Digital Journal
                </h3>
                <p className="text-muted-foreground font-inter leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
                  Capture your thoughts, moments, and reflections throughout the day. 
                  There's no limit - write as many entries as your heart desires.
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground/80 font-inter">
                  Tap the + button below to start your first reflection
                </p>
              </div>
            </div>
          )}

          {/* Today's entry count */}
          {entries.length > 0 && (() => {
            const today = new Date().toISOString().split('T')[0];
            const todayEntries = entries.filter(entry => entry.date === today);
            
            if (todayEntries.length > 0) {
              return (
                <div className="text-center mb-4 sm:mb-6">
                  <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                    <span>{todayEntries.length} reflection{todayEntries.length !== 1 ? 's' : ''} today</span>
                    {todayEntries.length > 1 && (
                      <span className="text-primary/60 hidden sm:inline">• Multiple moments captured</span>
                    )}
                  </div>
                </div>
              );
            }
            return null;
          })()}        {/* Diary Entries with Infinite Scroll */}
        <InfiniteScroll
          dataLength={entries.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={
            <div className="text-center py-6 sm:py-8">
              <div className="inline-flex items-center space-x-2 text-text-blue/60">
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0.1s]"></div>
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <span className="font-inter text-xs sm:text-sm ml-3">Loading more reflections...</span>
              </div>
            </div>
          }
          endMessage={
            <div className="text-center py-6 sm:py-8 text-text-blue/60">
              <p className="font-inter text-xs sm:text-sm">You've reached the end of your journal entries</p>
            </div>
          }
          scrollThreshold={0.9}        >
          <div className="relative">
            {entries.map((entry, index) => {
              // Check if this entry and the next entry are on the same date
              const nextEntry = entries[index + 1];
              const currentDate = entry.date;
              const nextDate = nextEntry?.date;
              const hasSameDayBefore = index > 0 && entries[index - 1]?.date === currentDate;
              const hasSameDayAfter = nextDate === currentDate;
              const isMultipleEntry = hasSameDayBefore || hasSameDayAfter;
              
              return (
                <div
                  key={entry.id}
                  ref={el => {
                    if (el) entryRefs.current[entry.id] = el;
                  }}
                  data-image-url={entry.imageUrl || ''}
                  className={`relative ${isMultipleEntry ? 'ml-3 sm:ml-4 border-l-2 border-primary/20 pl-4 sm:pl-6' : ''}`}
                >
                  {isMultipleEntry && (
                    <div className="absolute -left-1.5 sm:-left-2 top-6 sm:top-8 w-3 h-3 sm:w-4 sm:h-4 bg-primary/30 rounded-full border-2 border-background"></div>
                  )}
                  <DiaryEntryCard entry={entry} />
                </div>
              );
            })}
          </div>
        </InfiniteScroll>
      </main>{/* Floating Compose Button */}
      <FloatingComposeButton 
        onClick={() => setShowNewEntry(true)}
        hasEntriesToday={(() => {
          const today = new Date().toISOString().split('T')[0];
          return entries.some(entry => entry.date === today);
        })()}
      />
    </div>
  );
}
