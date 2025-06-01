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
    <div className="bg-background/90 entry-card rounded-3xl p-6 mb-8 shadow-lg animate-slide-up">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gentle/20 rounded-full flex items-center justify-center">
          <Pen className="text-gentle" size={16} />
        </div>
        <div>
          <h3 className="font-crimson text-lg font-semibold text-text-blue">Today's Reflection</h3>
          <p className="text-text-blue/60 text-sm font-inter">{currentDate}</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="bg-primary/10 rounded-2xl p-4">
          <Textarea 
            placeholder="What moments made today special? Let your thoughts flow..." 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-40 bg-transparent border-none resize-none font-lora text-text-blue placeholder-text-blue/50 focus:outline-none"
            autoFocus
          />
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-blue/50 font-inter">AI will create a title and artwork for you</span>
          <div className="flex space-x-3">
            <Button
              variant="ghost"
              onClick={onCancel}
              className="text-text-blue/70 hover:text-text-blue"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={createEntryMutation.isPending}
              className="bg-accent hover:bg-accent/90 text-text-blue font-medium py-2 px-6 rounded-xl transition-all duration-300"
            >
              {createEntryMutation.isPending ? "Saving..." : "Save Reflection"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
