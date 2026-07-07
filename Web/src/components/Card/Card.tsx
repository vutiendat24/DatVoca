import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'sm' | 'md' | 'lg' | 'none';
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  onClick,
  padding = 'md',
}) => {
  const base = `
    bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800
    shadow-sm ${paddingClasses[padding]} ${className}
  `;

  if (hover || onClick) {
    return (
      <motion.div
        whileHover={{ y: -2, boxShadow: '0 10px 40px rgba(236,72,153,0.12)' }}
        transition={{ duration: 0.2 }}
        className={`${base} cursor-pointer`}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={base}>{children}</div>;
};
