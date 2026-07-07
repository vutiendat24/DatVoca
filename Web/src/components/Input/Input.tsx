import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{leftIcon}</div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-4 py-2.5 rounded-xl border text-sm transition-all duration-200
              bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
              placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent
              ${error ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'}
              ${leftIcon ? 'pl-10' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-xs font-medium text-red-500">{error}</p>}
        {helperText && !error && <p className="text-xs text-gray-500">{helperText}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-2.5 rounded-xl border text-sm transition-all duration-200 resize-none
            bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent
            ${error ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'}
            ${className}
          `}
          rows={4}
          {...props}
        />
        {error && <p className="text-xs font-medium text-red-500">{error}</p>}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-2.5 rounded-xl border text-sm transition-all duration-200
            bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
            focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent
            ${error ? 'border-red-400' : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'}
            ${className}
          `}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="text-xs font-medium text-red-500">{error}</p>}
      </div>
    );
  },
);
Select.displayName = 'Select';
