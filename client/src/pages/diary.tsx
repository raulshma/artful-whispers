import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { useInfiniteEntries } from "@/hooks/useInfiniteEntries";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useFavoriteToggle } from "@/hooks/useFavoriteToggle";
import TimePrompt from "@/components/TimePrompt";
import NewEntryCard from "@/components/NewEntryCard";
import DiaryEntryCard from "@/components/DiaryEntryCard";
import FloatingComposeButton from "@/components/FloatingComposeButton";
import FloatingProfileButton from "@/components/FloatingProfileButton";
import FloatingThemeToggle from "@/components/FloatingThemeToggle"
import DiaryBackground from "@/components/DiaryBackground";
import InfiniteScroll from "react-infinite-scroll-component";
import type { DiaryEntry } from "@shared/schema";
import { motion } from "framer-motion";

// Lazy load the heavy loading animation
const LoadingAnimation = lazy(() => import("@/components/LoadingAnimation"));

export default function DiaryPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [currentBgImage, setCurrentBgImage] = useState<string | null>(null);
  
  // Favorite toggle hook
  const favoriteToggle = useFavoriteToggle();
  
  // Sequential animation states
  const location = useLocation();
  const skipLoading = location.state?.skipLoading;
  const [animationPhase, setAnimationPhase] = useState<'loading' | 'welcome' | 'content' | 'complete'>(
    skipLoading ? 'content' : 'loading'
  );
  const [showContent, setShowContent] = useState(false);
  const [isInitialEntryLoad, setIsInitialEntryLoad] = useState(true);
  
  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches, 
    []
  );

  // Use the optimized infinite entries hook
  const {
    entries,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isSuccess,
    refreshEntries,
  } = useInfiniteEntries({ limit: 5 });

  // Memoized date calculations
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  
  // Memoized today's entries
  const todayEntries = useMemo(() => 
    entries.filter(entry => entry.date === today), 
    [entries, today]
  );

  // Simplified intersection observer for background image updates
  const handleIntersection = useCallback((entry: IntersectionObserverEntry) => {
    if (entry.isIntersecting) {
      const imageUrl = (entry.target as HTMLElement).dataset.imageUrl;
      setCurrentBgImage(imageUrl || null);
    }
  }, []);

  const { observeElement } = useIntersectionObserver({
    threshold: 0.5, // Increased threshold for more precise background changes
    onIntersect: handleIntersection,
  });

  // Handle sequential animation phases
  useEffect(() => {
    if (skipLoading) {
      // When coming back from profile, immediately show content
      setShowContent(true);
      setAnimationPhase('complete');
      return;
    }

    if (isSuccess && animationPhase === 'loading') {
      // Respect reduced motion preferences with improved timing
      const loadingDuration = prefersReducedMotion ? 300 : 1800; // Reduced from 2500ms to 1800ms
      const welcomeDuration = prefersReducedMotion ? 50 : (entries.length === 0 ? 1200 : 80); // Reduced from 2000ms to 1200ms
      const contentDelay = prefersReducedMotion ? 0 : 300; // Reduced from 500ms to 300ms
      
      // Phase 1: Loading animation
      const loadingTimer = setTimeout(() => {
        setAnimationPhase('welcome');
        
        // Phase 2: Welcome message
        const welcomeTimer = setTimeout(() => {
          setAnimationPhase('content');
          
          // Phase 3: Fade in content
          const contentTimer = setTimeout(() => {
            setShowContent(true);
            setAnimationPhase('complete');
          }, contentDelay);
          
          return () => clearTimeout(contentTimer);
        }, welcomeDuration);
        
        return () => clearTimeout(welcomeTimer);
      }, loadingDuration);
      
      return () => clearTimeout(loadingTimer);
    }
  }, [isSuccess, animationPhase, entries.length, prefersReducedMotion]);
  // Check if we should show evening prompt
  useEffect(() => {
    const checkEveningPrompt = () => {
      const now = new Date();
      const hour = now.getHours();

      if (hour >= 20) {
        // After 8 PM
        const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD format
        const skipKey = `eveningPromptSkipped:${todayStr}`;

        // Check if user already clicked "Later" today
        if (localStorage.getItem(skipKey) === "true") {
          return;
        }

        // Check if there's been any entry activity today (show prompt regardless of existing entries)
        // This allows users to add multiple entries per day
        const lastEntryTime = localStorage.getItem(`lastEntryTime:${todayStr}`);
        const nowTime = Date.now();
        const twoHoursAgo = nowTime - 2 * 60 * 60 * 1000; // 2 hours in milliseconds

        // Show prompt if no entry was created in the last 2 hours
        if (!lastEntryTime || parseInt(lastEntryTime) < twoHoursAgo) {
          setShowPrompt(true);
        }
      }
    };

    checkEveningPrompt();
  }, [entries]);

  // Memoized event handlers to prevent unnecessary re-renders
  const handleStartNewEntry = useCallback(() => {
    setShowPrompt(false);
    setShowNewEntry(true);
  }, []);

  const handleEntryCreated = useCallback(async () => {
    setShowNewEntry(false);

    // Track when an entry was created for prompt logic
    const todayStr = new Date().toISOString().split("T")[0];
    localStorage.setItem(`lastEntryTime:${todayStr}`, Date.now().toString());

    // Refresh entries using the optimized hook
    await refreshEntries();
  }, [refreshEntries]);

  // Set initial background image when entries are first loaded
  useEffect(() => {
    if (entries.length > 0 && isInitialEntryLoad) {
      const bgImageUrl = entries.find((e) => e.date === today)?.imageUrl ||
                       entries[0]?.imageUrl ||
                       null;
      setCurrentBgImage(bgImageUrl);
      setIsInitialEntryLoad(false);
    }
  }, [entries, today, isInitialEntryLoad]);

  // Memoized close prompt handler
  const handleClosePrompt = useCallback(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const skipKey = `eveningPromptSkipped:${todayStr}`;
    localStorage.setItem(skipKey, "true");
    setShowPrompt(false);
  }, []);

  // Memoized floating compose button props
  const hasEntriesToday = useMemo(() => 
    todayEntries.length > 0, 
    [todayEntries]
  );

  // Handle favorite toggle
  const handleToggleFavorite = useCallback(async (entryId: number) => {
    await favoriteToggle.mutateAsync(entryId);
  }, [favoriteToggle]);
  return (
    <div className="min-h-screen bg-background mobile-safe-area relative">
      {/* Lazy-loaded Loading Overlay */}
      <Suspense fallback={null}>
        <LoadingAnimation theme={theme} isVisible={animationPhase === 'loading'} />
      </Suspense>
      
      {/* Background image appears only after loading completes */}
      {animationPhase !== 'loading' && <DiaryBackground imageUrl={currentBgImage} />}
      
      {/* Floating Profile Button - appears with content */}
      {showContent && <FloatingProfileButton />}
      
      {/* Floating Theme Toggle - appears with content */}
      {showContent && <FloatingThemeToggle />}
      
      {/* Time Prompt */}
      {showPrompt && showContent && (
        <TimePrompt
          onStartEntry={handleStartNewEntry}
          onClose={handleClosePrompt}
        />
      )}
      
      {/* Main Content with sequential reveal */}
      <motion.main
        className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pt-12 sm:pt-16 relative z-10 mobile-scroll"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
        animate={{
          opacity: animationPhase === 'content' || animationPhase === 'complete' ? 1 : 0,
          y: prefersReducedMotion ? 0 : (animationPhase === 'content' || animationPhase === 'complete' ? 0 : 20)
        }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }}
      >
        {/* New Entry Card */}
        {showNewEntry && showContent && (
          <NewEntryCard
            onEntryCreated={handleEntryCreated}
            onCancel={() => setShowNewEntry(false)}
          />
        )}
        
        {/* Welcome message for new users */}
        {entries.length === 0 && !showNewEntry && (animationPhase === 'welcome' || animationPhase === 'content' || animationPhase === 'complete') && (
          <motion.div
            className="text-center py-8 sm:py-12 mb-6 sm:mb-8"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: "easeOut", delay: animationPhase === 'welcome' ? 0 : 0.15 }}
          >
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-border/30">
              <motion.h3
                className="font-crimson text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: animationPhase === 'welcome' ? 0.2 : 0.35 }}
              >
                Welcome to Your Digital Journal
              </motion.h3>
              <motion.p
                className="text-muted-foreground font-inter leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: animationPhase === 'welcome' ? 0.4 : 0.55 }}
              >
                Capture your thoughts, moments, and reflections throughout the
                day. There's no limit - write as many entries as your heart
                desires.
              </motion.p>
              <motion.p
                className="text-xs sm:text-sm text-muted-foreground/80 font-inter"
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: animationPhase === 'welcome' ? 0.6 : 0.75 }}
              >
                Tap the + button below to start your first reflection
              </motion.p>
            </div>
          </motion.div>
        )}
        
        {/* Today's entry count - appears with content */}
        {todayEntries.length > 0 && showContent && (
          <motion.div
            className="text-center mb-4 sm:mb-6"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.2 }}
          >
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
              <span>
                {todayEntries.length} reflection
                {todayEntries.length !== 1 ? "s" : ""} today
              </span>
              {todayEntries.length > 1 && (
                <span className="text-primary/60 hidden sm:inline">
                  • Multiple moments captured
                </span>
              )}
            </div>
          </motion.div>
        )}
        
        {/* Diary Entries with Infinite Scroll - appears after welcome */}
        {showContent && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.6, delay: entries.length === 0 ? 0.3 : 0.15 }}
          >
            <InfiniteScroll
              dataLength={entries.length}
              next={fetchNextPage}
              hasMore={hasNextPage}
              loader={
                <div className="text-center py-6 sm:py-8">
                  <div className="inline-flex items-center space-x-2 text-text-blue/60">
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0.1s]"></div>
                    <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <span className="font-inter text-xs sm:text-sm ml-3">
                      Loading more reflections...
                    </span>
                  </div>
                </div>
              }
              endMessage={
                <div className="text-center py-6 sm:py-8 text-text-blue/60">
                  <p className="font-inter text-xs sm:text-sm">
                    You've reached the end of your journal entries
                  </p>
                </div>
              }
              scrollThreshold={0.9}
            >
              <div className="relative space-y-0.5">
                {entries.map((entry, index) => {
                  // Check if this entry and the next entry are on the same date
                  const nextEntry = entries[index + 1];
                  const currentDate = entry.date;
                  const nextDate = nextEntry?.date;
                  const hasSameDayBefore =
                    index > 0 && entries[index - 1]?.date === currentDate;
                  const hasSameDayAfter = nextDate === currentDate;
                  const isMultipleEntry = hasSameDayBefore || hasSameDayAfter;

                  return (
                    <motion.div
                      key={entry.id}
                      ref={(el) => {
                        if (el) observeElement(entry.id.toString(), el);
                      }}
                      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={prefersReducedMotion ? { duration: 0 } : { 
                        duration: 0.4, 
                        ease: "easeOut",
                        delay: Math.min(index * 0.06, 0.6) // Improved stagger: reduced from 0.1s to 0.06s, max delay from 1.0s to 0.6s
                      }}
                      data-image-url={entry.imageUrl || ""}
                      className={`relative transition-colors duration-200 hover:bg-foreground/5 rounded-lg ${
                        isMultipleEntry
                          ? "ml-2 sm:ml-3 border-l border-foreground/10 pl-3 sm:pl-4"
                          : ""
                      }`}
                    >
                      {isMultipleEntry && (
                        <div className="absolute -left-1.5 sm:-left-1.5 top-6 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-primary/20 rounded-full border border-background"></div>
                      )}
                      <DiaryEntryCard 
                        entry={entry} 
                        onToggleFavorite={handleToggleFavorite}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </InfiniteScroll>
          </motion.div>
        )}
      </motion.main>
      
      {/* Floating Compose Button - appears with content */}
      {showContent && (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, delay: 0.25, type: "spring", stiffness: 260, damping: 20 }}
        >
          <FloatingComposeButton
            onClick={() => setShowNewEntry(true)}
            hasEntriesToday={hasEntriesToday}
          />
        </motion.div>
      )}
    </div>
  );
}
