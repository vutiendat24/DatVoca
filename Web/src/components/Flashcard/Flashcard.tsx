import React from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';

export interface FlashcardProps {
  frontMain: string;
  frontSub?: string;
  backMain: string;
  backSub?: string;
  isFlipped: boolean;
  onFlip: () => void;
  onAudio?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  frontMain,
  frontSub,
  backMain,
  backSub,
  isFlipped,
  onFlip,
  onAudio,
  onSwipeLeft,
  onSwipeRight,
}) => {
  const [touchStart, setTouchStart] = React.useState<{x: number, y: number} | null>(null);
  const [isSwiping, setIsSwiping] = React.useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.isPrimary) {
      setTouchStart({ x: e.clientX, y: e.clientY });
      setIsSwiping(false);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!touchStart || !e.isPrimary) return;
    
    const distanceX = touchStart.x - e.clientX;
    const distanceY = touchStart.y - e.clientY;
    
    if (Math.abs(distanceX) > 40 && Math.abs(distanceY) < 100) {
      setIsSwiping(true);
      if (distanceX > 0) {
        onSwipeLeft?.();
      } else {
        onSwipeRight?.();
      }
    }
    setTouchStart(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isSwiping) {
      onFlip();
    }
    setIsSwiping(false);
  };
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => setTouchStart(null)}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onFlip();
        }
      }}
      className="w-full h-[300px] perspective-1000 cursor-pointer focus-visible:outline-none touch-pan-y select-none"
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, type: 'spring', damping: 20 }}
        className="relative w-full h-full preserve-3d"
      >
        {/* Front */}
        <div
          className={`absolute inset-0 backface-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex flex-col items-center justify-center transition-all duration-300 ${
            isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white capitalize text-center select-none leading-tight">
            {frontMain}
          </h1>
          {frontSub && (
            <p className="text-md sm:text-lg text-gray-400 font-mono mt-3 select-none">
              {frontSub}
            </p>
          )}
          {onAudio && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAudio();
              }}
              className="mt-6 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              <Volume2 size={20} />
            </button>
          )}
        </div>

        {/* Back */}
        <div
          className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm p-6 flex flex-col items-center justify-center transition-all duration-300 ${
            isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <p className="text-xl sm:text-2xl text-gray-800 dark:text-gray-200 text-center leading-relaxed font-semibold select-none">
            {backMain}
          </p>
          {backSub && (
            <p className="text-md sm:text-lg text-gray-500 dark:text-gray-400 text-center mt-3 select-none">
              {backSub}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};
