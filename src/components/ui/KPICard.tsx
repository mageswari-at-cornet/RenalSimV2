import React from 'react';
import { cn } from '../../utils/cn';

interface KPICardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  delta?: {
    value: number;
    direction: 'up' | 'down';
  };
  status?: 'good' | 'warning' | 'critical';
  className?: string;
  children?: React.ReactNode;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  subtitle,
  delta,
  status,
  className,
  children,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'good':
        return 'text-rs-green';
      case 'warning':
        return 'text-rs-amber';
      case 'critical':
        return 'text-rs-red';
      default:
        return 'text-renal-text';
    }
  };

  const getDeltaColor = () => {
    if (!delta) return '';
    return delta.direction === 'up' ? 'text-rs-red' : 'text-rs-green';
  };

  return (
    <div
      className={cn(
        'bg-gradient-to-br from-renal-panel to-renal-panel-secondary border border-renal-border rounded-[14px] p-4 shadow-card flex flex-col justify-between min-h-[110px]',
        className
      )}
    >
      <div className="text-xs font-medium text-renal-muted uppercase tracking-wider">
        {label}
      </div>
      
      <div className={cn('text-kpi text-center', getStatusColor())}>
        {value}
      </div>
      
      <div className="text-center">
        {delta && (
          <span className={cn('text-sm font-medium', getDeltaColor())}>
            {delta.direction === 'up' ? '↑' : '↓'} {Math.abs(delta.value)}%
          </span>
        )}
        {subtitle && (
          <div className="text-xs text-renal-muted mt-1">{subtitle}</div>
        )}
      </div>
      
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
};