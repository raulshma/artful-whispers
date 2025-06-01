import { Plus } from "lucide-react";

interface FloatingComposeButtonProps {
  onClick: () => void;
}

export default function FloatingComposeButton({
  onClick,
}: FloatingComposeButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 w-12 h-12 bg-gentle hover:bg-gentle/90 text-background rounded-full shadow-lg floating-compose transition-all duration-300 transform hover:scale-110 animate-float z-30 flex items-center justify-center border-2"
    >
      <Plus className="text-xl text-primary-foreground" size={24} />
    </button>
  );
}
