import { Plus } from "lucide-react";

interface FloatingComposeButtonProps {
  onClick: () => void;
}

export default function FloatingComposeButton({ onClick }: FloatingComposeButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="fixed bottom-8 right-8 w-16 h-16 bg-gentle hover:bg-gentle/90 text-background rounded-full shadow-lg floating-compose transition-all duration-300 transform hover:scale-110 animate-float z-30"
    >
      <Plus className="text-xl" size={24} />
    </button>
  );
}
