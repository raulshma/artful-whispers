import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

interface DiaryBackgroundProps {
  imageUrl: string | null;
}

export default function DiaryBackground({ imageUrl }: DiaryBackgroundProps) {
  const { theme } = useTheme();
  
  return (
    <AnimatePresence>
      {imageUrl && (
        <>
          <motion.div
            key={imageUrl}
            className="fixed inset-0 bg-fixed bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: imageUrl ? `url(${imageUrl})` : undefined
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          />
          {/* Theme-aware overlay */}
          <motion.div
            className={`fixed inset-0 pointer-events-none ${
              theme === 'dark' 
                ? 'bg-background/85 backdrop-blur-sm' 
                : 'bg-background/80 backdrop-blur-sm'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, delay: 0.2 }}
          />
        </>
      )}
    </AnimatePresence>
  );
}