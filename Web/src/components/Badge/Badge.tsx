import React from 'react';
import { DIFFICULTY_CONFIG } from '../../constants';
import type { Difficulty } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'pink' | 'blue' | 'green' | 'orange' | 'red' | 'purple';
  difficulty?: Difficulty;
  className?: string;
}

const variantClasses = {
  default: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  pink: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  purple: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', difficulty, className = '' }) => {
  if (difficulty) {
    const cfg = DIFFICULTY_CONFIG[difficulty];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.bgClass} ${cfg.textClass} ${className}`}>
        {cfg.label}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};
