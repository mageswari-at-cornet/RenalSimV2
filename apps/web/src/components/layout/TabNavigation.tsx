import React from 'react';
import { cn } from '../../utils/cn';
import type { TabType } from '../../types';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: { id: TabType; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'session', label: 'Session Data' },
  { id: 'volume', label: 'Volume & BP' },
  { id: 'adequacy', label: 'Adequacy' },
  { id: 'access', label: 'Access' },
  { id: 'labs', label: 'Labs & Meds' },
  { id: 'events', label: 'Events & Tasks' },
  { id: 'quality', label: 'Data Quality' },
];

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <nav className="flex items-center border-b border-renal-border overflow-x-auto scrollbar-thin">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-[3px]',
            activeTab === tab.id
              ? 'border-rs-blue text-renal-text'
              : 'border-transparent text-renal-muted hover:text-renal-text hover:bg-white/5'
          )}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};