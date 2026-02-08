import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { Patient } from '../../types';

interface PathwayStep {
  id: string;
  label: string;
  activation: number;
  color: string;
}

interface CausalPathway {
  id: string;
  name: string;
  steps: PathwayStep[];
  mechanism: string;
  context: string;
  interventionPoints: string[];
}

interface CausalPathwayVisualizationProps {
  patient: Patient;
}

export const CausalPathwayVisualization: React.FC<CausalPathwayVisualizationProps> = () => {
  const [selectedPathway, setSelectedPathway] = useState<string>('hemodynamic');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const pathways: CausalPathway[] = [
    {
      id: 'hemodynamic',
      name: 'Hemodynamic crash (UFR → IDH → perfusion)',
      steps: [
        { id: 'ufr', label: 'Fluid Removal (UFR)', activation: 85, color: '#3b82f6' },
        { id: 'bloodVol', label: 'Blood Volume Drop', activation: 75, color: '#3b82f6' },
        { id: 'cardiac', label: 'Cardiac Output', activation: 60, color: '#3b82f6' },
        { id: 'bp', label: 'Blood Pressure', activation: 45, color: '#10b981' },
        { id: 'crash', label: 'CRASH', activation: 90, color: '#ef4444' },
      ],
      mechanism: 'Limited cardiac reserve reduces refill and tolerance to UF. BP drops earlier and deeper, increasing IDH and perfusion stress.',
      context: 'Mean UFR 4.2 ml/kg/hr, IDH rate 8%.',
      interventionPoints: ['UF cap', 'Cool dialysate', 'Extend time'],
    },
    {
      id: 'hyperkalemia',
      name: 'HyperK arrhythmia',
      steps: [
        { id: 'diet', label: 'High K+ Intake', activation: 70, color: '#f59e0b' },
        { id: 'inadequate', label: 'Inadequate Clearance', activation: 65, color: '#f59e0b' },
        { id: 'elevation', label: 'K+ Elevation', activation: 80, color: '#ef4444' },
        { id: 'ecg', label: 'ECG Changes', activation: 55, color: '#ef4444' },
        { id: 'arrhythmia', label: 'Arrhythmia Risk', activation: 85, color: '#ef4444' },
      ],
      mechanism: 'Accumulation of potassium due to dietary intake and inadequate dialysis clearance leads to cardiac membrane instability.',
      context: 'Serum K+ 5.8 mEq/L, 2 weeks since last labs.',
      interventionPoints: ['Dialysate K 2K', 'K binder adherence', 'Dietary counseling'],
    },
    {
      id: 'cvcInfection',
      name: 'CVC inflammation and infection',
      steps: [
        { id: 'catheter', label: 'Catheter (CVC)', activation: 95, color: '#3b82f6' },
        { id: 'inflammation', label: 'Inflammation', activation: 70, color: '#3b82f6' },
        { id: 'vasodilation', label: 'Vasodilation', activation: 60, color: '#10b981' },
        { id: 'bpFragility', label: 'BP Fragility', activation: 50, color: '#10b981' },
        { id: 'mortality', label: 'Mortality', activation: 75, color: '#ef4444' },
      ],
      mechanism: 'Catheter-related inflammation can drive systemic inflammatory state, making BP harder to sustain and increasing infection-related events and mortality risk.',
      context: 'CVC duration 164 days, no recent fever.',
      interventionPoints: ['CVC exit plan', 'Infection audit', 'Access surveillance'],
    },
    {
      id: 'accessStenosis',
      name: 'Access stenosis → underdelivery',
      steps: [
        { id: 'stenosis', label: 'Stenosis', activation: 80, color: '#f59e0b' },
        { id: 'flowLimitation', label: 'Flow Limitation', activation: 75, color: '#f59e0b' },
        { id: 'inadequacy', label: 'Inadequacy', activation: 70, color: '#ef4444' },
        { id: 'uremia', label: 'Uremia', activation: 65, color: '#ef4444' },
        { id: 'mortality', label: 'Mortality', activation: 60, color: '#ef4444' },
      ],
      mechanism: 'Progressive stenosis limits blood flow, reducing dialysis adequacy and leading to uremic complications.',
      context: 'VP slope +4.2 mmHg/session, mean VP 185 mmHg.',
      interventionPoints: ['Access surveillance', 'Fistulogram', 'Access revision'],
    },
    {
      id: 'nonAdherence',
      name: 'Non-adherence spiral',
      steps: [
        { id: 'missedSessions', label: 'Missed Sessions', activation: 85, color: '#f59e0b' },
        { id: 'shortTreatment', label: 'Short Treatment', activation: 70, color: '#f59e0b' },
        { id: 'uremiaProgression', label: 'Uremia ↑', activation: 75, color: '#ef4444' },
        { id: 'symptoms', label: 'Symptoms ↑', activation: 80, color: '#ef4444' },
        { id: 'hospitalization', label: 'Hospitalization', activation: 70, color: '#ef4444' },
      ],
      mechanism: 'Missed and shortened treatments lead to progressive uremia, increasing symptoms and hospitalization risk.',
      context: '8.3% missed session rate, 15% premature terminations.',
      interventionPoints: ['Adherence outreach', 'Extra session', 'Education'],
    },
  ];

  const currentPathway = pathways.find(p => p.id === selectedPathway) || pathways[0];

  return (
    <div className="bg-gradient-to-br from-renal-panel to-renal-panel-secondary border border-renal-border rounded-[14px] p-5 shadow-card h-full">
      <h3 className="text-lg font-semibold text-renal-text mb-4">Active Causal Pathways</h3>
      
      {/* Pathway Selector */}
      <div className="relative mb-6">
        <label className="text-xs text-renal-muted uppercase tracking-wider mb-2 block">
          Select pathway
        </label>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between p-3 bg-renal-bg border border-renal-border rounded-lg text-renal-text hover:border-rs-blue transition-colors"
        >
          <span>{currentPathway.name}</span>
          <ChevronDown className={`w-5 h-5 text-renal-muted transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-renal-panel border border-renal-border rounded-lg shadow-xl max-h-60 overflow-y-auto">
            {pathways.map((pathway) => (
              <button
                key={pathway.id}
                onClick={() => {
                  setSelectedPathway(pathway.id);
                  setIsDropdownOpen(false);
                }}
                className={cn(
                  'w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors',
                  selectedPathway === pathway.id ? 'text-rs-blue bg-rs-blue/10' : 'text-renal-text'
                )}
              >
                {pathway.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pathway Visualization */}
      <div className="w-full">
        <h4 className="text-sm font-semibold text-renal-text mb-4">Active Causal Pathways</h4>
        
        {/* Steps Flow - Full Width */}
        <div className="flex items-center justify-center">
          {currentPathway.steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center" style={{ width: '120px' }}>
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center relative"
                  style={{ 
                    background: `conic-gradient(${step.color} ${step.activation * 3.6}deg, #1e2a3a ${step.activation * 3.6}deg)`,
                  }}
                >
                  <div className="w-12 h-12 rounded-full bg-renal-panel flex items-center justify-center">
                    <span className="text-xs font-bold text-renal-text">{step.activation}%</span>
                  </div>
                </div>
                <span className="text-xs text-renal-muted mt-2 text-center" style={{ maxWidth: '100px', lineHeight: '1.2' }}>{step.label}</span>
              </div>
              
              {index < currentPathway.steps.length - 1 && (
                <div className="flex items-center justify-center px-2" style={{ width: '60px' }}>
                  <svg width="48" height="20" className="text-renal-muted">
                    <defs>
                      <marker id={`arrowhead-${index}`} markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                        <polygon points="0 0, 6 2, 0 4" fill="#9aa8bb" />
                      </marker>
                    </defs>
                    <line x1="0" y1="10" x2="42" y2="10" stroke="#9aa8bb" strokeWidth="1.5" markerEnd={`url(#arrowhead-${index})`} />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Mechanism of Failure Panel - Moved to bottom */}
      <div className="mt-4 p-4 bg-renal-bg rounded-lg border border-renal-border">
        <h4 className="text-sm font-semibold text-renal-text mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-rs-amber flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>Mechanism of Failure</span>
        </h4>
        
        <div className="bg-rs-amber/10 border border-rs-amber/30 rounded-lg p-3 mb-3">
          <p className="text-sm text-renal-text leading-relaxed">
            {currentPathway.mechanism}
          </p>
        </div>
        
        <p className="text-sm text-renal-muted mb-3">
          <span className="font-medium text-renal-text">Context:</span> {currentPathway.context}
        </p>
        
        <div>
          <h5 className="text-xs font-medium text-renal-muted uppercase tracking-wider mb-2">
            Intervention points
          </h5>
          <p className="text-sm text-renal-text">
            {currentPathway.interventionPoints.join(', ')}.
          </p>
        </div>
      </div>
    </div>
  );
};