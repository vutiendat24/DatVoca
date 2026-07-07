import React from 'react';
import { motion } from 'framer-motion';

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
      className={`rounded-full border-2 border-pink-200 border-t-pink-500 ${sizes[size]} ${className}`}
    />
  );
};

export const LoadingPage: React.FC = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Loading…</p>
    </div>
  </div>
);

export const SkeletonCard: React.FC = () => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 animate-pulse">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4 mb-3" />
    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-1/2 mb-2" />
    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full w-2/3" />
  </div>
);
