import { Moon } from "lucide-react";
import { memo } from "react";

interface TimePromptProps {
  onStartEntry: () => void;
  onClose: () => void;
}

function TimePrompt({ onStartEntry, onClose }: TimePromptProps) {
  return (
    <div className="fixed inset-0 bg-text-blue/20 backdrop-blur-sm z-40 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-background rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full shadow-2xl border border-primary/30 animate-fade-in">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gentle/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Moon className="text-gentle" size={24} />
          </div>
          <h2 className="font-crimson text-xl sm:text-2xl font-semibold text-text-blue mb-3 sm:mb-4">Evening Reflection</h2>
          <p className="font-lora text-sm sm:text-base text-text-blue/80 mb-6 leading-relaxed">
            It's time to capture today's moments. What story does your heart want to tell? You can add as many reflections as you need.
          </p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button 
              onClick={onClose}
              className="flex-1 bg-secondary/20 hover:bg-secondary/30 text-text-blue font-medium py-3 px-6 rounded-xl sm:rounded-2xl transition-all duration-300 touch-manipulation"
            >
              Later
            </button>
            <button 
              onClick={onStartEntry}
              className="flex-1 bg-accent hover:bg-accent/90 text-text-blue font-medium py-3 px-6 rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 touch-manipulation"
            >
              Add Reflection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(TimePrompt);
