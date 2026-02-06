import React from 'react';
import { Activity, Users, Clock } from 'lucide-react';

interface HeaderProps {
  facilityName?: string;
  lastUpdated?: string;
  onRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  facilityName = 'Apollo Dialysis Center',
  lastUpdated,
  onRefresh,
}) => {
  const currentDate = new Date().toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header className="h-14 bg-renal-bg border-b border-renal-border flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-rs-blue rounded-lg flex items-center justify-center">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-renal-text">RenalSim</h1>
        </div>
        <div className="h-6 w-px bg-renal-border mx-2" />
        <div className="flex items-center gap-2 text-renal-muted">
          <Users className="w-4 h-4" />
          <span className="text-sm">{facilityName}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-renal-muted text-sm">
          <Clock className="w-4 h-4" />
          <span>{currentDate}</span>
        </div>
        
        {lastUpdated && (
          <div className="flex items-center gap-2 text-xs text-renal-muted">
            <span>Last updated: {lastUpdated}</span>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
              >
                <Activity className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};