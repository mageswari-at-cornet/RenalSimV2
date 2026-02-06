import React, { useState } from 'react';
import type { Patient } from '../../types';

interface CopilotLeversProps {
  patient: Patient;
}

interface Lever {
  id: string;
  label: string;
  enabled: boolean;
  category: 'volume' | 'access' | 'adequacy' | 'electrolyte' | 'adherence';
}

export const CopilotLevers: React.FC<CopilotLeversProps> = () => {
  const [levers, setLevers] = useState<Lever[]>([
    { id: 'ufCap', label: 'UF cap', enabled: true, category: 'volume' },
    { id: 'coolDialysate', label: 'Cool dialysate', enabled: false, category: 'volume' },
    { id: 'extraSession', label: 'Extra session', enabled: false, category: 'adequacy' },
    { id: 'dialysateK', label: 'Dialysate K 2K', enabled: false, category: 'electrolyte' },
    { id: 'adherenceOutreach', label: 'Adherence outreach', enabled: true, category: 'adherence' },
    { id: 'extendTime', label: 'Extend time', enabled: false, category: 'adequacy' },
    { id: 'sodiumProfiling', label: 'Sodium profiling', enabled: false, category: 'volume' },
    { id: 'accessSurveillance', label: 'Access surveillance', enabled: true, category: 'access' },
    { id: 'kBinderAdherence', label: 'K binder adherence', enabled: false, category: 'electrolyte' },
    { id: 'nutritionPlan', label: 'Nutrition plan', enabled: false, category: 'adherence' },
    { id: 'cvcExitPlan', label: 'CVC exit plan', enabled: false, category: 'access' },
  ]);

  const toggleLever = (id: string) => {
    setLevers(prev => prev.map(lever => 
      lever.id === id ? { ...lever, enabled: !lever.enabled } : lever
    ));
  };

  const activeCount = levers.filter(l => l.enabled).length;

  return (
    <div className="bg-renal-panel border-y border-renal-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-renal-text">
            Copilot levers <span className="text-renal-muted text-sm font-normal">(counterfactual controls)</span>
          </h3>
          <span className="text-xs text-renal-muted">
            {activeCount} interventions active
          </span>
        </div>
        
        <div className="grid grid-cols-5 gap-x-8 gap-y-3">
          {levers.map((lever) => (
            <label 
              key={lever.id}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={lever.enabled}
                  onChange={() => toggleLever(lever.id)}
                  className="sr-only"
                />
                <div className={`w-10 h-5 rounded-full transition-colors duration-200 ${
                  lever.enabled ? 'bg-rs-red' : 'bg-renal-border'
                }`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 mt-0.5 ${
                    lever.enabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </div>
              </div>
              <span className={`text-sm transition-colors ${
                lever.enabled ? 'text-renal-text' : 'text-renal-muted group-hover:text-renal-text'
              }`}>
                {lever.label}
              </span>
            </label>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-renal-border/50">
          <p className="text-xs text-renal-muted">
            Deltas below reflect directional, causal-inspired effects on mediators and risks (demo).
          </p>
        </div>
      </div>
    </div>
  );
};