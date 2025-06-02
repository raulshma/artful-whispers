import { Plus } from "lucide-react";
import { memo } from "react";

interface FloatingComposeButtonProps {
  onClick: () => void;
  hasEntriesToday?: boolean;
}

function FloatingComposeButton({
  onClick,
  hasEntriesToday = false,
}: FloatingComposeButtonProps) {
  const tooltipText = hasEntriesToday 
    ? "Add another reflection" 
    : "Add new reflection";

  return (    <div className="fixed bottom-4 right-4 z-30 group mobile-safe-area">
      <button
        onClick={onClick}
        className="w-10 h-10 sm:w-12 sm:h-12 bg-card/90 backdrop-blur-md hover:bg-card border border-border/50 hover:border-gentle/50 text-foreground hover:text-gentle rounded-full shadow-lg hover:shadow-xl transition-all duration-500 ease-out transform hover:scale-105 animate-float flex items-center justify-center relative touch-manipulation mobile-touch-target group"
        title={tooltipText}
        aria-label={tooltipText}
      >
        <Plus className="text-lg sm:text-xl transition-colors duration-300 group-hover:text-gentle" size={24} />
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-full bg-gentle/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        {/* Small indicator for multiple entries */}
        {hasEntriesToday && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gentle border-2 border-background rounded-full shadow-sm"></div>
        )}
      </button>
        {/* Tooltip - only show on larger screens */}
      <div className="hidden md:block absolute bottom-full right-0 mb-3 px-3 py-2 bg-card/95 backdrop-blur-md text-foreground text-sm rounded-lg shadow-lg border border-border/50 opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
        {tooltipText}
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-card/95"></div>
      </div>    </div>
  );
}

export default memo(FloatingComposeButton);
