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
import { motion, AnimatePresence } from "framer-motion";

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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { isLoading, isSuccess } = useQuery<DiaryEntry[]>({
    queryKey: ["/api/diary-entries", { limit, offset }],
    select: (data: DiaryEntry[]) => data,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onSettled: () => {
      // After initial data is loaded, start fade out animation
      if (isInitialLoad) {
        const timer = setTimeout(() => {
          setIsInitialLoad(false);
        }, 500); // Short delay for a smoother transition
        return () => clearTimeout(timer);
      }
    },
  });

  // Reset initial load state if data is already loaded
  useEffect(() => {
    if (isSuccess && isInitialLoad) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, isInitialLoad]);

  // Use a separate effect to handle data fetching and state updates
  useEffect(() => {
    let isMounted = true;

    const fetchEntries = async () => {
      try {
        const response = await fetch(
          `/api/diary-entries?limit=${limit}&offset=${offset}`
        );
        if (!response.ok) throw new Error("Failed to fetch entries");

        const newEntries: DiaryEntry[] = await response.json();

        if (!isMounted) return;

        if (newEntries.length === 0) {
          setHasMore(false);
          return;
        }

        if (offset === 0) {
          // Reset entries when offset is 0 (initial load or refresh)
          setEntries(newEntries);
        } else {
          // Append new entries, avoiding duplicates
          setEntries((prevEntries) => {
            // Create a map of existing entries by ID for quick lookup
            const entriesMap = new Map(
              prevEntries.map((entry) => [entry.id, entry])
            );

            // Add new entries that don't already exist
            newEntries.forEach((entry) => {
              if (!entriesMap.has(entry.id)) {
                entriesMap.set(entry.id, entry);
              }
            });

            // Convert map values back to array and sort by date (newest first)
            return Array.from(entriesMap.values()).sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );
          });
        }
      } catch (error) {
        console.error("Error fetching diary entries:", error);
        if (isMounted) {
          setHasMore(false);
        }
      }
    };

    fetchEntries();

    return () => {
      isMounted = false;
    };
  }, [offset, limit]);
  // Check if we should show evening prompt
  useEffect(() => {
    const checkEveningPrompt = () => {
      const now = new Date();
      const hour = now.getHours();

      if (hour >= 20) {
        // After 8 PM
        const today = now.toISOString().split("T")[0]; // YYYY-MM-DD format
        const skipKey = `eveningPromptSkipped:${today}`;

        // Check if user already clicked "Later" today
        if (localStorage.getItem(skipKey) === "true") {
          return;
        }

        // Check if there's been any entry activity today (show prompt regardless of existing entries)
        // This allows users to add multiple entries per day
        const lastEntryTime = localStorage.getItem(`lastEntryTime:${today}`);
        const now = Date.now();
        const twoHoursAgo = now - 2 * 60 * 60 * 1000; // 2 hours in milliseconds

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
      setOffset((prev) => prev + limit);
    }
  };

  const handleStartNewEntry = () => {
    setShowPrompt(false);
    setShowNewEntry(true);
  };
  const handleEntryCreated = async () => {
    setShowNewEntry(false);

    // Track when an entry was created for prompt logic
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`lastEntryTime:${today}`, Date.now().toString());

    try {
      // Invalidate and refetch the first page
      await queryClient.invalidateQueries({
        queryKey: ["/api/diary-entries"],
        refetchType: "all",
      });

      // Reset pagination and fetch fresh data
      setOffset(0);
      setHasMore(true);

      // Fetch the first page of entries
      const response = await fetch(
        `/api/diary-entries?limit=${limit}&offset=0`
      );
      if (!response.ok) throw new Error("Failed to fetch entries");

      const newEntries = await response.json();
      setEntries(newEntries);
      setHasMore(newEntries.length >= limit);
    } catch (error) {
      console.error("Error refreshing entries:", error);
      // Even if there's an error, we'll still update the UI optimistically
      setOffset(0);
      setEntries([]);
      setHasMore(true);
    }
  };

  // Set initial background image when entries change
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const bgImageUrl =
      entries.find((e) => e.date === today)?.imageUrl ||
      entries[0]?.imageUrl ||
      null;
    setCurrentBgImage(bgImageUrl);
  }, [entries]);

  // Intersection observer to update background based on visible entry
  useEffect(() => {
    const callback = (entries: IntersectionObserverEntry[]) => {
      const visibleEntry = entries.find(
        (entry) => entry.intersectionRatio >= 0.5
      );
      if (visibleEntry) {
        const imageUrl = (visibleEntry.target as HTMLElement).dataset.imageUrl;
        const newUrl = imageUrl || null;
        setCurrentBgImage((prev) => (prev !== newUrl ? newUrl : prev));
      }
    };

    const observer = new IntersectionObserver(callback, { threshold: 0.5 });

    Object.values(entryRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [entries]);
  return (
    <div className="min-h-screen bg-background mobile-safe-area relative">
      {/* Lofi Loading Overlay */}
      <AnimatePresence>
        {(isLoading || isInitialLoad) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#f9f5ff] to-[#e9e3ff]"
          >
            <div className="relative w-full max-w-md px-8">
              {/* Animated Coffee Cup */}
              <motion.div
                className="relative mx-auto w-32 h-32 mb-8"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {/* Coffee cup */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-16 bg-[#4a2d1e] rounded-b-3xl border-t-8 border-[#2c1a0f]" />
                {/* Coffee */}
                <motion.div
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-12 bg-[#6f4e37] rounded-b-2xl origin-bottom"
                  animate={{
                    scaleY: [1, 0.8, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                {/* Steam */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-0 h-8 w-1.5 bg-white/40 rounded-full"
                    style={{
                      left: `calc(50% + ${(i - 1) * 12}px)`,
                      y: 0,
                      opacity: 0.6,
                    }}
                    animate={{
                      y: -40,
                      opacity: 0,
                      scale: [1, 1.5, 1],
                    }}
                    transition={{
                      duration: 3,
                      delay: i * 0.5,
                      repeat: Infinity,
                      repeatDelay: 1,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </motion.div>

              {/* Loading text */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <h2 className="text-2xl font-light text-[#4a2d1e] mb-2">
                  Brewing your thoughts
                </h2>
                <p className="text-[#6f4e37]/80 font-light">
                  Taking a moment to gather your reflections...
                </p>
              </motion.div>

              {/* Subtle noise texture */}
              <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E\")",
                }}
              />
            </div>

            {/* Subtle floating elements */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-[#d9c7ff] opacity-20"
                style={{
                  width: Math.random() * 20 + 10,
                  height: Math.random() * 20 + 10,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  x: [0, Math.random() * 40 - 20, 0],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
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
            const today = new Date().toISOString().split("T")[0];
            const skipKey = `eveningPromptSkipped:${today}`;
            localStorage.setItem(skipKey, "true");
            setShowPrompt(false);
          }}
        />
      )}{" "}
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pt-12 sm:pt-16 relative z-10 mobile-scroll">
        {/* New Entry Card */}
        {showNewEntry && (
          <NewEntryCard
            onEntryCreated={handleEntryCreated}
            onCancel={() => setShowNewEntry(false)}
          />
        )}{" "}
        {/* Helpful message for multiple entries */}
        {entries.length === 0 && !showNewEntry && (
          <div className="text-center py-8 sm:py-12 mb-6 sm:mb-8">
            <div className="bg-card/50 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-border/30">
              <h3 className="font-crimson text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">
                Welcome to Your Digital Journal
              </h3>
              <p className="text-muted-foreground font-inter leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
                Capture your thoughts, moments, and reflections throughout the
                day. There's no limit - write as many entries as your heart
                desires.
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground/80 font-inter">
                Tap the + button below to start your first reflection
              </p>
            </div>
          </div>
        )}
        {/* Today's entry count */}
        {entries.length > 0 &&
          (() => {
            const today = new Date().toISOString().split("T")[0];
            const todayEntries = entries.filter(
              (entry) => entry.date === today
            );

            if (todayEntries.length > 0) {
              return (
                <div className="text-center mb-4 sm:mb-6">
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
                </div>
              );
            }
            return null;
          })()}{" "}
        {/* Diary Entries with Infinite Scroll */}
        <InfiniteScroll
          dataLength={entries.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={
            !isInitialLoad && (
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
            )
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
          <div className="relative">
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
                <div
                  key={entry.id}
                  ref={(el) => {
                    if (el) entryRefs.current[entry.id] = el;
                  }}
                  data-image-url={entry.imageUrl || ""}
                  className={`relative ${
                    isMultipleEntry
                      ? "ml-3 sm:ml-4 border-l-2 border-primary/20 pl-4 sm:pl-6"
                      : ""
                  }`}
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
      </main>
      {/* Floating Compose Button */}
      <FloatingComposeButton
        onClick={() => setShowNewEntry(true)}
        hasEntriesToday={(() => {
          const today = new Date().toISOString().split("T")[0];
          return entries.some((entry) => entry.date === today);
        })()}
      />
    </div>
  );
}
