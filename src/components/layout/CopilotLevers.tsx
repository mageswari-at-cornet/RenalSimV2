import React, { useState, useCallback, useEffect } from 'react';
import type { Patient } from '../../types';

export interface LeverState {
  cooling: boolean;
  sodium_profile: boolean;
  uf_cap: boolean;
  extend_time: boolean;
  extra_session: boolean;
  k_bath_2k: boolean;
  k_binder_adherence: boolean;
  access_surveillance: boolean;
  cvc_exit_plan: boolean;
  adherence_outreach: boolean;
  nutrition_plan: boolean;
}

export interface MediatorScores {
  'Volume/UFR stress': number;
  'IDH burden': number;
  'Adherence burden': number;
  'Adequacy/delivery gap': number;
  'Access failure risk': number;
  'Metabolic instability': number;
  'Inflammation/Infection': number;
  'Anemia/Nutrition': number;
  'Cardio-vascular frailty': number;
}

interface CopilotLeversProps {
  patient: Patient;
  onLeversChange?: (levers: LeverState, mediators: MediatorScores) => void;
}

const DEFAULT_MEDIATORS: MediatorScores = {
  'Volume/UFR stress': 0.65,
  'IDH burden': 0.58,
  'Adherence burden': 0.42,
  'Adequacy/delivery gap': 0.35,
  'Access failure risk': 0.48,
  'Metabolic instability': 0.52,
  'Inflammation/Infection': 0.45,
  'Anemia/Nutrition': 0.38,
  'Cardio-vascular frailty': 0.55,
};

const DEFAULT_LEVERS: LeverState = {
  cooling: false,
  sodium_profile: false,
  uf_cap: true,
  extend_time: false,
  extra_session: false,
  k_bath_2k: false,
  k_binder_adherence: false,
  access_surveillance: true,
  cvc_exit_plan: false,
  adherence_outreach: true,
  nutrition_plan: false,
};

const clamp = (x: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, x));

const applyLevers = (baseMediators: MediatorScores, levers: LeverState, isCVC: boolean): MediatorScores => {
  const mm = { ...baseMediators };

  if (levers.cooling) {
    mm['IDH burden'] = clamp(mm['IDH burden'] * 0.65, 0.0, 1.0);
  }

  if (levers.sodium_profile) {
    mm['IDH burden'] = clamp(mm['IDH burden'] * 0.80, 0.0, 1.0);
  }

  if (levers.uf_cap) {
    mm['Volume/UFR stress'] = clamp(mm['Volume/UFR stress'] * 0.72, 0.0, 1.0);
    mm['IDH burden'] = clamp(mm['IDH burden'] * 0.82, 0.0, 1.0);
  }

  if (levers.extend_time) {
    mm['Volume/UFR stress'] = clamp(mm['Volume/UFR stress'] * 0.78, 0.0, 1.0);
    mm['Adequacy/delivery gap'] = clamp(mm['Adequacy/delivery gap'] * 0.72, 0.0, 1.0);
  }

  if (levers.extra_session) {
    mm['Volume/UFR stress'] = clamp(mm['Volume/UFR stress'] * 0.62, 0.0, 1.0);
    mm['Metabolic instability'] = clamp(mm['Metabolic instability'] * 0.75, 0.0, 1.0);
  }

  if (levers.k_bath_2k) {
    mm['Metabolic instability'] = clamp(mm['Metabolic instability'] * 0.78, 0.0, 1.0);
  }

  if (levers.k_binder_adherence) {
    mm['Metabolic instability'] = clamp(mm['Metabolic instability'] * 0.70, 0.0, 1.0);
  }

  if (levers.access_surveillance) {
    mm['Access failure risk'] = clamp(mm['Access failure risk'] * 0.65, 0.0, 1.0);
    mm['Adequacy/delivery gap'] = clamp(mm['Adequacy/delivery gap'] * 0.82, 0.0, 1.0);
  }

  if (levers.cvc_exit_plan && isCVC) {
    mm['Inflammation/Infection'] = clamp(mm['Inflammation/Infection'] * 0.60, 0.0, 1.0);
    mm['Access failure risk'] = clamp(mm['Access failure risk'] * 0.85, 0.0, 1.0);
  }

  if (levers.adherence_outreach) {
    mm['Adherence burden'] = clamp(mm['Adherence burden'] * 0.62, 0.0, 1.0);
    mm['Volume/UFR stress'] = clamp(mm['Volume/UFR stress'] * 0.86, 0.0, 1.0);
  }

  if (levers.nutrition_plan) {
    mm['Anemia/Nutrition'] = clamp(mm['Anemia/Nutrition'] * 0.70, 0.0, 1.0);
    mm['Inflammation/Infection'] = clamp(mm['Inflammation/Infection'] * 0.86, 0.0, 1.0);
  }

  return mm;
};

export const CopilotLevers: React.FC<CopilotLeversProps> = ({ patient, onLeversChange }) => {
  const isCVC = patient?.phenotype?.some((p: string) => p.includes('CVC'));
  const [levers, setLevers] = useState<LeverState>(DEFAULT_LEVERS);

  const calculateMediators = useCallback((currentLevers: LeverState): MediatorScores => {
    return applyLevers(DEFAULT_MEDIATORS, currentLevers, isCVC);
  }, [isCVC]);

  // Send initial mediators to parent on mount
  useEffect(() => {
    const initialMediators = calculateMediators(levers);
    onLeversChange?.(levers, initialMediators);
  }, []); // Empty dependency array - only run on mount

  const toggleLever = (key: keyof LeverState) => {
    setLevers(prev => {
      const newLevers = { ...prev, [key]: !prev[key] };
      const newMediators = calculateMediators(newLevers);
      onLeversChange?.(newLevers, newMediators);
      return newLevers;
    });
  };

  const activeCount = Object.values(levers).filter(Boolean).length;

  const leverConfig: { key: keyof LeverState; label: string; category: string }[] = [
    { key: 'cooling', label: 'Cool dialysate', category: 'IDH Support' },
    { key: 'sodium_profile', label: 'Sodium Profiling', category: 'IDH Support' },
    { key: 'uf_cap', label: 'UF cap', category: 'Volume' },
    { key: 'extend_time', label: 'Extend time', category: 'Adequacy' },
    { key: 'extra_session', label: 'Extra session', category: 'Volume' },
    { key: 'k_bath_2k', label: 'K bath 2K', category: 'Metabolic' },
    { key: 'k_binder_adherence', label: 'K binder adherence', category: 'Metabolic' },
    { key: 'access_surveillance', label: 'Access surveillance', category: 'Access' },
    { key: 'cvc_exit_plan', label: 'CVC exit plan', category: 'Access' },
    { key: 'adherence_outreach', label: 'Adherence outreach', category: 'Social' },
    { key: 'nutrition_plan', label: 'Nutrition plan', category: 'Anemia' },
  ];

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
          {leverConfig.map((lever) => (
            <label 
              key={lever.key}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={levers[lever.key]}
                  onChange={() => toggleLever(lever.key)}
                  className="sr-only"
                />
                <div className={`w-10 h-5 rounded-full transition-colors duration-200 ${
                  levers[lever.key] ? 'bg-rs-blue' : 'bg-renal-border'
                }`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200 mt-0.5 ${
                    levers[lever.key] ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </div>
              </div>
              <span className={`text-sm transition-colors ${
                levers[lever.key] ? 'text-renal-text' : 'text-renal-muted group-hover:text-renal-text'
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
