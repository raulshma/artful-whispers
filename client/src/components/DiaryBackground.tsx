import { AnimatePresence, motion } from "framer-motion";

interface DiaryBackgroundProps {
  imageUrl: string | null;
}

export default function DiaryBackground({ imageUrl }: DiaryBackgroundProps) {
  return (
    <AnimatePresence>
      {imageUrl && (
        <motion.div
          key={imageUrl}
          className="fixed inset-0 bg-fixed bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: imageUrl ? `url(${imageUrl})` : undefined
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </AnimatePresence>
  );
}