import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
  return (
    <div
      className={cn(
        'bg-gradient-to-br from-renal-panel to-renal-panel-secondary border border-renal-border rounded-[14px] p-4 shadow-card transition-all duration-200',
        onClick && 'cursor-pointer hover:translate-y-[-2px] hover:shadow-xl',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};