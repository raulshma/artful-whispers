import { Moon } from "lucide-react";

interface TimePromptProps {
  onStartEntry: () => void;
  onClose: () => void;
}

export default function TimePrompt({ onStartEntry, onClose }: TimePromptProps) {
  return (
    <div className="fixed inset-0 bg-text-blue/20 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-background rounded-3xl p-8 max-w-md w-full shadow-2xl border border-primary/30 animate-fade-in">
        <div className="text-center">
          <div className="w-16 h-16 bg-gentle/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Moon className="text-gentle text-2xl" size={32} />
          </div>
          <h2 className="font-crimson text-2xl font-semibold text-text-blue mb-4">Evening Reflection</h2>
          <p className="font-lora text-text-blue/80 mb-6 leading-relaxed">
            It's time to capture today's moments. What story does your heart want to tell? You can add as many reflections as you need.
          </p>
          <div className="flex space-x-3">
            <button 
              onClick={onClose}
              className="flex-1 bg-secondary/20 hover:bg-secondary/30 text-text-blue font-medium py-3 px-6 rounded-2xl transition-all duration-300"
            >
              Later
            </button>
            <button 
              onClick={onStartEntry}
              className="flex-1 bg-accent hover:bg-accent/90 text-text-blue font-medium py-3 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105"
            >
              Add Reflection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
