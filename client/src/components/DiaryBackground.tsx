import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { memo } from "react";

interface DiaryBackgroundProps {
  imageUrl: string | null;
}

function DiaryBackground({ imageUrl }: DiaryBackgroundProps) {
  const { theme } = useTheme();

  // Gentle, soothing easing curve
  const soothingEase = [0.25, 0.46, 0.45, 0.94]; // Custom cubic-bezier for smooth feel

  return (
    <div className="fixed inset-0">
      {/* Base background layer - always present to prevent flashing */}
      <motion.div 
        className="absolute inset-0 bg-background"
        animate={{ 
          backgroundColor: theme === 'dark' 
            ? 'hsl(222, 84%, 4.9%)' 
            : 'hsl(36, 100%, 98%)' 
        }}
        transition={{ duration: 0.4, ease: soothingEase }}
      />
      
      <AnimatePresence mode="wait">
        {imageUrl && (
          <motion.div
            key={`${imageUrl}-${theme}`}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ 
              duration: 0.4, 
              ease: soothingEase,
              scale: { duration: 0.5, ease: soothingEase }
            }}
          >
            {/* Background Image with gentle scale animation */}
            <motion.div
              className="absolute inset-0 bg-fixed bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${imageUrl})`,
              }}
              initial={{ filter: 'blur(4px)' }}
              animate={{ filter: 'blur(0px)' }}
              transition={{ duration: 0.3, ease: soothingEase }}
            />
            {/* Theme-aware overlay with proper initial opacity */}
            <motion.div
              className={`absolute inset-0 pointer-events-none ${
                theme === "dark"
                  ? "bg-background/65 backdrop-blur-sm"
                  : "bg-background/60 backdrop-blur-sm"
              }`}
              initial={{ 
                opacity: theme === "dark" ? 0.65 : 0.60 
              }}
              animate={{ 
                opacity: theme === "dark" ? 0.65 : 0.60 
              }}
              transition={{ duration: 0.3, ease: soothingEase }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(DiaryBackground);
