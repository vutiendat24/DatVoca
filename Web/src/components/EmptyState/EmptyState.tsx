import React from 'react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 gap-4 text-center"
  >
    <div className="w-20 h-20 rounded-full bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center text-pink-400 text-4xl">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xs">{description}</p>}
    </div>
    {action}
  </motion.div>
);
