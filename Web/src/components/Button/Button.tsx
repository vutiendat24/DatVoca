import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-pink-500 hover:bg-pink-600 text-white shadow-lg shadow-pink-200/50 dark:shadow-pink-900/30',
  secondary: 'bg-pink-100 hover:bg-pink-200 text-pink-700 dark:bg-pink-900/40 dark:hover:bg-pink-900/60 dark:text-pink-300',
  ghost: 'hover:bg-pink-50 text-pink-600 dark:hover:bg-pink-900/30 dark:text-pink-400',
  danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200/50',
  outline: 'border-2 border-pink-300 hover:bg-pink-50 text-pink-600 dark:border-pink-700 dark:hover:bg-pink-900/30 dark:text-pink-400',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-xl gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-2xl gap-2',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className={`
        inline-flex items-center justify-center font-semibold transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:pointer-events-none
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `}
      disabled={disabled || isLoading}
      {...(props as unknown as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {isLoading ? <Loader2 size={16} className="animate-spin" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </motion.button>
  );
};
