import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { cn } from '../../utils/cn';

interface DataQualityTabProps {
  patient: { id: string };
}

export const DataQualityTab: React.FC<DataQualityTabProps> = () => {
  const dataQualityScore = 87;
  
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
      { name: 'Phosphorus', status: 'overdue' },
    ],
    daysSinceLastDraw: 21,
  };

  return (
    <div className="space-y-6">
      {/* Overall Data Quality Score */}
      <div className="flex justify-center">
        <Card className="w-full max-w-md text-center py-8">
          <h3 className="text-sm font-semibold text-renal-muted uppercase tracking-wider mb-4">Data Quality Score</h3>
          <div className="relative inline-flex items-center justify-center">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="#1e2a3a"
                strokeWidth="16"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke={dataQualityScore >= 80 ? '#23d18b' : dataQualityScore >= 60 ? '#ffb020' : '#ff4d4f'}
                strokeWidth="16"
                fill="none"
                strokeDasharray={`${(dataQualityScore / 100) * 439.82} 439.82`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn(
                'text-5xl font-bold',
                dataQualityScore >= 80 ? 'text-rs-green' : dataQualityScore >= 60 ? 'text-rs-amber' : 'text-rs-red'
              )}>
                {dataQualityScore}%
              </span>
              <span className={cn(
                'text-lg font-medium mt-1',
                dataQualityScore >= 80 ? 'text-rs-green' : dataQualityScore >= 60 ? 'text-rs-amber' : 'text-rs-red'
              )}>
                {dataQualityScore >= 80 ? 'GOOD' : dataQualityScore >= 60 ? 'FAIR' : 'POOR'}
              </span>
            </div>
          </div>
          <p className="text-sm text-renal-muted mt-4">
            Prediction accuracy: <span className="text-rs-green font-medium">High confidence</span>
          </p>
        </Card>
      </div>

      {/* Session Data and Lab Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-renal-text mb-4">Session Data Completeness (Last 30 Sessions)</h3>
          <div className="space-y-4">
            {sessionCompleteness.map((item) => (
              <div key={item.metric}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-renal-text">{item.metric}</span>
                  <span className={cn(
                    'text-sm font-bold',
                    item.completeness >= 90 ? 'text-rs-green' : item.completeness >= 75 ? 'text-rs-amber' : 'text-rs-red'
                  )}>
                    {item.completeness}%
                  </span>
                </div>
                <div className="h-2 bg-renal-bg rounded-full overflow-hidden">
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
          
          <div className="mt-4 p-3 bg-renal-bg rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-renal-text">Overall Completeness</span>
              <span className="text-lg font-bold text-rs-green">90.8%</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-renal-text mb-4">Laboratory Data Availability</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-renal-bg rounded-lg">
              <div className="text-xs text-renal-muted mb-1">Expected Draws (Quarterly)</div>
              <div className="text-2xl font-bold text-renal-text">{labAvailability.expected}</div>
            </div>
            <div className="p-3 bg-renal-bg rounded-lg">
              <div className="text-xs text-renal-muted mb-1">Actual Draws</div>
              <div className="text-2xl font-bold text-renal-text">{labAvailability.actual}</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-renal-text">Completion Rate</span>
              <span className="text-sm font-bold text-rs-green">{labAvailability.rate}%</span>
            </div>
            <div className="h-2 bg-renal-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-rs-green rounded-full transition-all duration-500"
                style={{ width: `${labAvailability.rate}%` }}
              />
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="text-xs font-medium text-renal-muted uppercase tracking-wider">Critical Labs Status</div>
            {labAvailability.criticalLabs.map((lab) => (
              <div key={lab.name} className="flex items-center justify-between p-2 bg-renal-bg rounded">
                <span className="text-sm text-renal-text">{lab.name}</span>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  lab.status === 'current' ? 'bg-rs-green/20 text-rs-green' : 'bg-rs-red/20 text-rs-red'
                )}>
                  {lab.status === 'current' ? 'Current ✓' : '2 weeks overdue'}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-rs-amber/10 border border-rs-amber/30 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rs-amber" />
              <span className="text-sm text-rs-amber">
                Days since last draw: {labAvailability.daysSinceLastDraw}
              </span>
            </div>
          </div>
        </Card>
      </div>


    </div>
  );
};