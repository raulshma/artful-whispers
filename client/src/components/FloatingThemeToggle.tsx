import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { memo, useCallback } from 'react';

function FloatingThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  const handleToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);
  return (
    <motion.div
      className="fixed top-4 left-4 z-50 mobile-safe-area"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >      <Button
        onClick={handleToggle}
        size="icon"
        variant="outline"
        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-card/90 backdrop-blur-md border-border/50 hover:border-gentle/50 shadow-lg hover:shadow-xl transition-all duration-500 ease-out mobile-touch-target touch-manipulation hover:bg-card group"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        <AnimatePresence mode="wait">
          {theme === 'light' ? (
            <motion.div
              key="moon"
              initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.25, 0.46, 0.45, 0.94],
                scale: { type: "spring", stiffness: 300, damping: 20 }
              }}
            >
              <Moon className="h-5 w-5 sm:h-6 sm:w-6 text-foreground group-hover:text-gentle transition-colors duration-300" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
              transition={{ 
                duration: 0.3, 
                ease: [0.25, 0.46, 0.45, 0.94],
                scale: { type: "spring", stiffness: 300, damping: 20 }
              }}
            >
              <Sun className="h-5 w-5 sm:h-6 sm:w-6 text-foreground group-hover:text-gentle transition-colors duration-300" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-full bg-gentle/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>      </Button>
    </motion.div>
  );
}

export default memo(FloatingThemeToggle);
