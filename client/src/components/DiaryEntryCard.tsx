import { Heart, Share, Book, Waves, Leaf } from "lucide-react";
import type { DiaryEntry } from "@shared/schema";

interface DiaryEntryCardProps {
  entry: DiaryEntry;
}

export default function DiaryEntryCard({ entry }: DiaryEntryCardProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getMoodIcon = (mood: string | null) => {
    if (!mood) return Heart;
    
    switch (mood.toLowerCase()) {
      case 'peaceful':
      case 'calm':
        return Leaf;
      case 'contemplative':
      case 'reflective':
        return Waves;
      case 'cozy':
      case 'comfortable':
        return Book;
      default:
        return Heart;
    }
  };

  const getReadTime = (content: string) => {
    const words = content.split(' ').length;
    const readTime = Math.max(1, Math.ceil(words / 200)); // Average reading speed
    return `${readTime} min read`;
  };

  const MoodIcon = getMoodIcon(entry.mood);

  const emotions = entry.emotions ? JSON.parse(entry.emotions) : [];
  const displayMood = entry.mood || "Reflective";

  return (
    <article className="mb-12 animate-fade-in">
      <div className="relative">
        {/* Text Overlay */}
        <div className="relative p-4">
          <div className="w-full">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-background/80 rounded-full flex items-center justify-center">
                <MoodIcon className="text-gentle text-sm" size={16} />
              </div>
              <div>
                <p className="font-inter text-sm text-text-blue/80">{formatDate(entry.date)}</p>
                <p className="font-inter text-xs text-text-blue/60 capitalize">
                  {displayMood} {emotions.length > 0 && `• ${emotions.slice(0, 2).join(', ')}`}
                </p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="font-crimson text-2xl font-semibold text-text-blue leading-relaxed">
                {entry.title}
              </h2>
              <div className="font-lora text-text-blue/90 leading-loose">
                {entry.content.split('\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index} className="mb-3 text-justify text-shadow-sm">
                      {paragraph}
                    </p>
                  )
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-8">
              <div className="flex items-center space-x-4">
                <button className="text-text-blue/60 hover:text-text-blue transition-colors">
                  <Heart size={18} />
                </button>
                <button className="text-text-blue/60 hover:text-text-blue transition-colors">
                  <Share size={18} />
                </button>
              </div>
              <span className="font-inter text-xs text-text-blue/50">
                {getReadTime(entry.content)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
