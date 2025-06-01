import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InsertDiaryEntry } from "@shared/schema";

interface NewEntryCardProps {
  onEntryCreated: () => void;
  onCancel: () => void;
}

export default function NewEntryCard({ onEntryCreated, onCancel }: NewEntryCardProps) {
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createEntryMutation = useMutation({
    mutationFn: async (entry: InsertDiaryEntry) => {
      const response = await apiRequest("POST", "/api/diary-entries", entry);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/diary-entries"] });
      toast({
        title: "Reflection Saved",
        description: "AI is creating your title and artwork...",
      });
      onEntryCreated();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save your reflection. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!content.trim()) {
      toast({
        title: "Write Something",
        description: "Please share your thoughts to create a reflection.",
        variant: "destructive",
      });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    createEntryMutation.mutate({
      content: content.trim(),
      date: today,
    });
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="group bg-card/95 backdrop-blur-md entry-card rounded-3xl p-8 mb-8 shadow-xl border border-border/50 animate-slide-up hover:shadow-2xl transition-all duration-500 ease-out">
      {/* Header with gentle animation */}
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
          <Pen className="text-primary" size={18} />
        </div>
        <div className="flex-1">
          <h3 className="font-crimson text-xl font-semibold text-foreground mb-1">
            New Reflection
          </h3>
          <p className="text-muted-foreground text-sm font-inter tracking-wide">
            {currentDate} • You can create multiple reflections each day
          </p>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Enhanced textarea container with subtle border animation */}
        <div className="relative group/textarea">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl blur-sm opacity-0 group-focus-within/textarea:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-muted/30 rounded-2xl p-6 border border-border/30 group-focus-within/textarea:border-primary/30 transition-all duration-300">
            <Textarea 
              placeholder="What's on your mind right now? Capture this moment - you can write as many reflections as you'd like throughout the day..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-44 bg-transparent border-none resize-none font-lora text-base text-foreground placeholder-muted-foreground/60 focus:outline-none leading-relaxed"
              autoFocus
            />
          </div>
        </div>
        
        {/* Enhanced footer with better spacing and subtle animations */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary/40 rounded-full animate-pulse"></div>
            <span className="text-xs text-muted-foreground font-inter tracking-wide">
              AI will craft a beautiful title and artwork
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={onCancel}
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 px-4 py-2 rounded-xl transition-all duration-200 font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={createEntryMutation.isPending}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-medium py-2.5 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              {createEntryMutation.isPending ? (
                <span className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </span>
              ) : (
                "Save Reflection"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
