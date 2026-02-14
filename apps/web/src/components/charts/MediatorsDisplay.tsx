import React from 'react';
import type { MediatorScores } from '../layout/CopilotLevers';

interface MediatorsDisplayProps {
  mediators: MediatorScores;
}

export const MediatorsDisplay: React.FC<MediatorsDisplayProps> = ({ mediators }) => {
  const mediatorConfig: { key: keyof MediatorScores; color: string }[] = [
    { key: 'Volume/UFR stress', color: '#3b82f6' },
    { key: 'IDH burden', color: '#ef4444' },
    { key: 'Adherence burden', color: '#f59e0b' },
    { key: 'Adequacy/delivery gap', color: '#8b5cf6' },
    { key: 'Access failure risk', color: '#ec4899' },
    { key: 'Metabolic instability', color: '#10b981' },
    { key: 'Inflammation/Infection', color: '#f97316' },
    { key: 'Anemia/Nutrition', color: '#06b6d4' },
    { key: 'Cardio-vascular frailty', color: '#84cc16' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {mediatorConfig.map(({ key, color }) => {
        const value = mediators[key];
        const percentage = Math.round(value * 100);
        
        return (
          <div key={key} className="bg-renal-bg rounded-lg p-3 border border-renal-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-renal-muted truncate" title={key}>
                {key}
              </span>
              <span className="text-sm font-bold text-renal-text">
                {percentage}%
              </span>
            </div>
            <div className="h-2 bg-renal-panel rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: color,
                  opacity: 0.8,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
