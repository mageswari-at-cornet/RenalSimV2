import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-rs-blue/50';
  
  const variantClasses = {
    primary: 'bg-rs-blue text-white hover:brightness-110',
    secondary: 'bg-transparent border border-rs-blue text-rs-blue hover:bg-rs-blue/10',
    danger: 'bg-rs-red text-white hover:brightness-110',
    ghost: 'bg-transparent text-renal-muted hover:text-renal-text hover:bg-white/5',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};