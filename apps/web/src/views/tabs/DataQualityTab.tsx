import React from 'react';
import { Card } from '../../components/ui/Card';
import { cn } from '../../utils/cn';
import type { Patient } from '../../types';

interface DataQualityTabProps {
  patient: Patient;
}

export const DataQualityTab: React.FC<DataQualityTabProps> = ({ patient }) => {
  const dataQualityScore = patient.dataQualityScore || 87;

  const sessionCompleteness = [
    { metric: 'BP Nadir', completeness: 94, status: 'good' },
    { metric: 'Venous Pressure', completeness: 88, status: 'good' },
    { metric: 'Weight Measurements', completeness: 100, status: 'good' },
    { metric: 'UF Volume', completeness: 96, status: 'good' },
    { metric: 'Session Notes', completeness: 76, status: 'warning' },
  ];

  const labAvailability = {
    expected: 12,
    actual: 11,
    rate: 91.7,
    criticalLabs: [
      { name: 'Hemoglobin', status: 'current' },
      { name: 'Potassium', status: 'current' },
    ],
    daysSinceLastDraw: 21,
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Overall Data Quality Score */}
        <Card className="text-center flex flex-col justify-center py-6">
          <h3 className="text-xs font-semibold text-renal-muted uppercase tracking-wider mb-4">Overall Quality</h3>
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="48"
                stroke="#1e2a3a"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="56"
                cy="56"
                r="48"
                stroke={dataQualityScore >= 80 ? '#23d18b' : dataQualityScore >= 60 ? '#ffb020' : '#ff4d4f'}
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(dataQualityScore / 100) * 301.59} 301.59`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn(
                'text-3xl font-bold',
                dataQualityScore >= 80 ? 'text-rs-green' : dataQualityScore >= 60 ? 'text-rs-amber' : 'text-rs-red'
              )}>
                {dataQualityScore}%
              </span>
              <span className={cn(
                'text-[10px] font-bold mt-0.5',
                dataQualityScore >= 80 ? 'text-rs-green' : dataQualityScore >= 60 ? 'text-rs-amber' : 'text-rs-red'
              )}>
                {dataQualityScore >= 80 ? 'GOOD' : dataQualityScore >= 60 ? 'FAIR' : 'POOR'}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-[10px] text-renal-muted uppercase tracking-wider">Prediction Confidence</span>
            <div className="text-xs text-rs-green font-medium">High</div>
          </div>
        </Card>

        {/* Session Data Completeness */}
        <Card>
          <h3 className="text-xs font-semibold text-renal-muted uppercase tracking-wider mb-4">Session Data (30d)</h3>
          <div className="space-y-3">
            {sessionCompleteness.map((item) => (
              <div key={item.metric}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-renal-text">{item.metric}</span>
                  <span className={cn(
                    'text-xs font-bold',
                    item.completeness >= 90 ? 'text-rs-green' : item.completeness >= 75 ? 'text-rs-amber' : 'text-rs-red'
                  )}>
                    {item.completeness}%
                  </span>
                </div>
                <div className="h-1.5 bg-renal-bg rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      item.completeness >= 90 ? 'bg-rs-green' : item.completeness >= 75 ? 'bg-rs-amber' : 'bg-rs-red'
                    )}
                    style={{ width: `${item.completeness}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-renal-border/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-renal-muted">OVERALL</span>
              <span className="text-sm font-bold text-rs-green">90.8%</span>
            </div>
          </div>
        </Card>

        {/* Laboratory Data Availability */}
        <Card className="flex flex-col">
          <h3 className="text-xs font-semibold text-renal-muted uppercase tracking-wider mb-4">Laboratory Data</h3>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-2.5 bg-renal-bg/50 rounded-lg border border-renal-border/30">
              <div className="text-[10px] text-renal-muted uppercase tracking-wider mb-1">Expected</div>
              <div className="text-xl font-bold text-renal-text">{labAvailability.expected}</div>
            </div>
            <div className="p-2.5 bg-renal-bg/50 rounded-lg border border-renal-border/30">
              <div className="text-[10px] text-renal-muted uppercase tracking-wider mb-1">Actual</div>
              <div className="text-xl font-bold text-renal-text">{labAvailability.actual}</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-renal-text">Completion Rate</span>
              <span className="text-xs font-bold text-rs-green">{labAvailability.rate}%</span>
            </div>
            <div className="h-1.5 bg-renal-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-rs-green rounded-full transition-all duration-500"
                style={{ width: `${labAvailability.rate}%` }}
              />
            </div>
          </div>

          <div className="mt-auto space-y-2">
            <div className="flex items-center justify-between px-3 py-2 bg-rs-green/5 rounded-lg border border-rs-green/10">
              <span className="text-xs font-medium text-renal-text">Hemoglobin</span>
              <span className="text-[10px] font-bold text-rs-green bg-rs-green/10 px-1.5 py-0.5 rounded uppercase">Current</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 bg-rs-green/5 rounded-lg border border-rs-green/10">
              <span className="text-xs font-medium text-renal-text">Potassium</span>
              <span className="text-[10px] font-bold text-rs-green bg-rs-green/10 px-1.5 py-0.5 rounded uppercase">Current</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};