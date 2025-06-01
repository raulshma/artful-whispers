import { Plus } from "lucide-react";

interface FloatingComposeButtonProps {
  onClick: () => void;
  hasEntriesToday?: boolean;
}

export default function FloatingComposeButton({
  onClick,
  hasEntriesToday = false,
}: FloatingComposeButtonProps) {
  const tooltipText = hasEntriesToday 
    ? "Add another reflection" 
    : "Add new reflection";

  return (
    <div className="fixed bottom-8 right-8 z-30 group">
      <button
        onClick={onClick}
        className="w-14 h-14 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 animate-float flex items-center justify-center relative"
        title={tooltipText}
      >
        <Plus className="text-xl" size={28} />
        
        {/* Pulse ring animation */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary to-accent opacity-30 animate-ping"></div>
        
        {/* Small indicator for multiple entries */}
        {hasEntriesToday && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent border-2 border-background rounded-full"></div>
        )}
      </button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-background/90 backdrop-blur-sm text-foreground text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        {tooltipText}
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-background/90"></div>
      </div>
    </div>
  );
}
