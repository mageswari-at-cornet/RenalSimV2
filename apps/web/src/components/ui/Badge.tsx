import React from 'react';
import { cn } from '../../utils/cn';
import type { RiskLevel, AlertSeverity } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'risk' | 'alert';
  riskLevel?: RiskLevel;
  severity?: AlertSeverity;
  count?: number;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  riskLevel,
  severity,
  count,
  className,
}) => {
  const getBadgeClasses = () => {
    if (variant === 'risk' && riskLevel) {
      switch (riskLevel) {
        case 'High':
          return 'border-rs-red text-rs-red bg-rs-red/10';
        case 'Medium':
          return 'border-rs-amber text-rs-amber bg-rs-amber/10';
        case 'Low':
          return 'border-rs-green text-rs-green bg-rs-green/10';
      }
    }

    if (variant === 'alert' && severity) {
      switch (severity) {
        case 'critical':
          return 'bg-rs-red text-white';
        case 'warning':
          return 'bg-rs-amber text-black';
        case 'info':
          return 'bg-rs-blue text-white';
      }
    }

    return 'border-renal-border text-renal-muted bg-renal-panel';
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border',
        getBadgeClasses(),
        className
      )}
    >
      {children}
      {count !== undefined && (
        <span className="font-bold">{count}</span>
      )}
    </span>
  );
};