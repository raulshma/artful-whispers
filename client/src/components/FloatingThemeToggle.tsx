import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export default function FloatingThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      size="icon"
      variant="outline"
      className="fixed top-4 left-4 z-50 h-12 w-12 rounded-full bg-background/80 backdrop-blur-md border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-foreground transition-all duration-300" />
      ) : (
        <Sun className="h-5 w-5 text-foreground transition-all duration-300" />
      )}
    </Button>
  );
}
