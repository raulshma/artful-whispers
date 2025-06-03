import { motion, AnimatePresence } from "framer-motion";
import { memo, useMemo } from "react";

interface LoadingAnimationProps {
  theme: 'light' | 'dark';
  isVisible: boolean;
}

const LoadingAnimation = memo(function LoadingAnimation({ theme, isVisible }: LoadingAnimationProps) {
  // Gentle, soothing easing curve
  const soothingEase = [0.22, 1, 0.36, 1];
  
  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches, 
    []
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={prefersReducedMotion ? { duration: 0.2 } : { duration: 0.8, ease: soothingEase }}
          className={`fixed inset-0 z-50 flex items-center justify-center ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
              : 'bg-gradient-to-br from-[#f9f5ff] to-[#e9e3ff]'
          }`}
        >
          <div className="relative w-full max-w-md px-8">            {/* Animated Coffee Cup */}
            <motion.div
              className="relative mx-auto w-32 h-32 mb-8"
              animate={prefersReducedMotion ? {} : {
                y: [0, -10, 0],
              }}                transition={prefersReducedMotion ? { duration: 0 } : {
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
            >
              {/* Coffee cup */}
              <div 
                className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-16 ${
                  theme === 'dark' ? 'bg-[#3d2519]' : 'bg-[#4a2d1e]'
                } rounded-b-3xl border-t-8 ${
                  theme === 'dark' ? 'border-[#1a1009]' : 'border-[#2c1a0f]'
                }`} 
              />              {/* Coffee */}
              <motion.div
                className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-12 ${
                  theme === 'dark' ? 'bg-[#5a3d2b]' : 'bg-[#6f4e37]'
                } rounded-b-2xl origin-bottom`}
                animate={prefersReducedMotion ? {} : {                  scaleY: [1, 0.8, 1],
                }}
                transition={prefersReducedMotion ? { duration: 0 } : {
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />              {/* Steam */}
              {!prefersReducedMotion && [...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute top-0 h-8 w-1.5 ${
                    theme === 'dark' ? 'bg-white/20' : 'bg-white/40'
                  } rounded-full`}
                  style={{
                    left: `calc(50% + ${(i - 1) * 12}px)`,
                  }}
                  initial={{ y: 0, opacity: 0.6 }}
                  animate={{
                    y: -40,
                    opacity: 0,
                    scale: [1, 1.5, 1],
                  }}                  transition={{
                    duration: 2.5,
                    delay: i * 0.4,
                    repeat: Infinity,
                    repeatDelay: 0.8,
                    ease: "easeOut",
                  }}
                />
              ))}
            </motion.div>            {/* Loading text */}
            <motion.div
              className="text-center"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.2, duration: 0.6 }}
            >
              <h2 className={`text-2xl font-light ${
                theme === 'dark' ? 'text-[#d4b59e]' : 'text-[#4a2d1e]'
              } mb-2`}>
                Brewing your thoughts
              </h2>
              <p className={`${
                theme === 'dark' ? 'text-[#d4b59e]/80' : 'text-[#6f4e37]/80'
              } font-light`}>
                Taking a moment to gather your reflections...
              </p>
            </motion.div>

            {/* Subtle noise texture */}
            <div
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E\")",
              }}
            />
          </div>          {/* Optimized floating elements - reduced count */}
          {!prefersReducedMotion && [...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${
                theme === 'dark' ? 'bg-[#6b46c1]' : 'bg-[#d9c7ff]'
              } opacity-20`}
              style={{
                width: Math.random() * 15 + 8,
                height: Math.random() * 15 + 8,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, Math.random() * 20 - 10, 0],
                opacity: [0.1, 0.2, 0.1],
              }}              transition={{
                duration: Math.random() * 6 + 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default LoadingAnimation;
