import { Heart, Share, Book, Waves, Leaf } from "lucide-react";
import { memo } from "react";
import type { DiaryEntry } from "@shared/schema";

interface DiaryEntryCardProps {
  entry: DiaryEntry;
}

function DiaryEntryCard({ entry }: DiaryEntryCardProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getMoodIcon = (mood: string | null) => {
    if (!mood) return Heart;

    switch (mood.toLowerCase()) {
      case "peaceful":
      case "calm":
        return Leaf;
      case "contemplative":
      case "reflective":
        return Waves;
      case "cozy":
      case "comfortable":
        return Book;
      default:
        return Heart;
    }
  };

  const getReadTime = (content: string) => {
    const words = content.split(" ").length;
    const readTime = Math.max(1, Math.ceil(words / 200)); // Average reading speed
    return `${readTime} min read`;
  };

  const MoodIcon = getMoodIcon(entry.mood);

  const emotions = entry.emotions ? JSON.parse(entry.emotions) : [];
  const displayMood = entry.mood || "Reflective";

  return (
    <article className="mb-6 sm:mb-8 md:mb-12 animate-fade-in">
      <div className="relative">
        {/* Text Overlay */}
        <div className="relative p-3 sm:p-4 md:p-5">
          <div className="w-full">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4 md:mb-6">
              <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-background/80 rounded-full flex items-center justify-center mobile-touch-target">
                <MoodIcon className="text-gentle" size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                  <p className="font-inter text-xs sm:text-sm text-text-blue/80">
                    {formatDate(entry.date)}
                  </p>
                  <span className="hidden sm:block w-1 h-1 bg-text-blue/40 rounded-full"></span>
                  <p className="font-inter text-xs sm:text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-full inline-block mt-1 sm:mt-0">
                    {formatTime(entry.createdAt)}
                  </p>
                </div>
                <p className="font-inter text-xs text-text-blue/60 capitalize mt-1 truncate">
                  {displayMood}{" "}
                  {emotions.length > 0 &&
                    `• ${emotions.slice(0, 2).join(", ")}`}
                </p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h2 className="font-crimson text-lg sm:text-xl md:text-2xl font-semibold text-text-blue leading-relaxed">
                {entry.title}
              </h2>
              <div className="font-lora text-sm sm:text-base text-text-blue/90 leading-relaxed sm:leading-loose">
                {entry.content.split("\n").map(
                  (paragraph, index) =>
                    paragraph.trim() && (
                      <p
                        key={index}
                        className="mb-2 sm:mb-3 text-justify text-shadow-sm"
                      >
                        {paragraph}
                      </p>
                    )
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 sm:mt-6 md:mt-8">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <button className="text-text-blue/60 hover:text-text-blue transition-colors touch-manipulation mobile-touch-target p-2 -m-2 rounded-full hover:bg-background/50">
                  <Heart size={16} />
                </button>
                <button className="text-text-blue/60 hover:text-text-blue transition-colors touch-manipulation mobile-touch-target p-2 -m-2 rounded-full hover:bg-background/50">
                  <Share size={16} />
                </button>
              </div>

              <div className="text-xs sm:text-sm text-text-blue/50 font-inter">
                {getReadTime(entry.content)}              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default memo(DiaryEntryCard);
