import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { KPICard } from '../../components/ui/KPICard';

import { TrendChart } from '../../components/charts/TrendChart';
import { mockAccessInfo, mockAccessMetrics, generateMockSessions } from '../../data/mockData';
import { cn } from '../../utils/cn';
import type { Patient } from '../../types';

interface AccessTabProps {
  patient: Patient;
}

export const AccessTab: React.FC<AccessTabProps> = ({ patient }) => {
  const sessions = generateMockSessions(patient.id).slice(0, 24);
  
  const vpTrendData = sessions.map((s) => ({
    x: s.date.slice(5),
    y: s.vp,
  })).reverse();

  const accessEvents = [
    { date: '2023-12-10', event: 'Bleeding', severity: 'Moderate' },
    { date: '2023-11-22', event: 'Infection', severity: 'Mild' },
    { date: '2023-09-15', event: 'Clotting', severity: 'Moderate' },
  ];

  const riskScore = 72;

  return (
    <div className="space-y-6">
      {/* Access Info and Risk Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-renal-text mb-4">Access Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-renal-muted mb-1">Access Type</div>
              <div className="text-lg font-bold text-renal-text">{mockAccessInfo.type}</div>
              <div className="text-sm text-renal-muted">{mockAccessInfo.location}</div>
            </div>
            <div>
              <div className="text-xs text-renal-muted mb-1">Insertion Date</div>
              <div className="text-lg font-bold text-renal-text">{mockAccessInfo.insertionDate}</div>
              <div className="text-sm text-rs-amber">{mockAccessInfo.age} months old</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-renal-border">
            <div className="text-xs text-renal-muted mb-2">Previous Access History</div>
            <ul className="space-y-1">
              {mockAccessInfo.history.map((item, idx) => (
                <li key={idx} className="text-sm text-renal-text">• {item}</li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-renal-text mb-4">Access Risk Score</h3>
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#1e2a3a"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke={riskScore > 70 ? '#ff4d4f' : riskScore > 40 ? '#ffb020' : '#23d18b'}
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(riskScore / 100) * 351.86} 351.86`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn(
                'text-3xl font-bold',
                riskScore > 70 ? 'text-rs-red' : riskScore > 40 ? 'text-rs-amber' : 'text-rs-green'
              )}>
                {riskScore}%
              </span>
              <span className={cn(
                'text-sm font-medium',
                riskScore > 70 ? 'text-rs-red' : riskScore > 40 ? 'text-rs-amber' : 'text-rs-green'
              )}>
                {riskScore > 70 ? 'HIGH RISK' : riskScore > 40 ? 'MEDIUM RISK' : 'LOW RISK'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Access Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <KPICard
          label="VP Slope"
          value={`+${mockAccessMetrics.vpSlope.toFixed(1)}`}
          subtitle="mmHg/session"
          status={mockAccessMetrics.vpSlope > 3 ? 'critical' : 'warning'}
        />
        <KPICard
          label="Mean VP"
          value={`${mockAccessMetrics.meanVP}`}
          subtitle="mmHg"
          status={mockAccessMetrics.meanVP > 180 ? 'warning' : 'good'}
        />
        <KPICard
          label="Alarms/Session"
          value={mockAccessMetrics.alarmsPerSession.toFixed(1)}
          subtitle="Average"
        />
        <KPICard
          label="Bleeding Events"
          value={mockAccessMetrics.bleedingEvents}
          subtitle="Last 3 months"
          status={mockAccessMetrics.bleedingEvents > 2 ? 'warning' : 'good'}
        />
        <KPICard
          label="Cannulation Difficulty"
          value={`${mockAccessMetrics.cannulationDifficulty}%`}
          subtitle="Of sessions"
          status={mockAccessMetrics.cannulationDifficulty > 20 ? 'warning' : 'good'}
        />
      </div>

      {/* VP Trend Chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-renal-text">Venous Pressure Trend (Last 24 Sessions)</h3>
          {mockAccessMetrics.vpSlope > 3 && (
            <div className="flex items-center gap-2 text-rs-red text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>VP slope exceeds 3 mmHg/session - Stenosis risk detected</span>
            </div>
          )}
        </div>
        <div className="h-64">
          <TrendChart
            data={vpTrendData}
            warningValue={180}
            criticalValue={200}
            color="#ff4d4f"
          />
        </div>
      </Card>

      {/* Complications and Event Log */}
      <Card>
        <h3 className="text-sm font-semibold text-renal-text mb-4">Access Event Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-renal-border">
                <th className="text-left px-4 py-2 text-xs font-bold text-renal-muted uppercase">Date</th>
                <th className="text-left px-4 py-2 text-xs font-bold text-renal-muted uppercase">Event</th>
                <th className="text-left px-4 py-2 text-xs font-bold text-renal-muted uppercase">Severity</th>
              </tr>
            </thead>
            <tbody>
              {accessEvents.map((event, idx) => (
                <tr key={idx} className="border-b border-renal-border/50">
                  <td className="px-4 py-2 text-sm text-renal-text">{event.date}</td>
                  <td className="px-4 py-2 text-sm text-renal-text">{event.event}</td>
                  <td className="px-4 py-2">
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      event.severity === 'High' ? 'bg-rs-red/20 text-rs-red' :
                      event.severity === 'Moderate' ? 'bg-rs-amber/20 text-rs-amber' :
                      'bg-rs-blue/20 text-rs-blue'
                    )}>
                      {event.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 bg-renal-bg rounded-lg">
          <h4 className="text-xs font-medium text-renal-muted uppercase mb-2">CVC Infection Risk</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-renal-muted">Days since insertion</span>
              <span className="text-rs-amber font-medium">164 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-renal-muted">Entry site status</span>
              <span className="text-rs-green">Clean, no erythema</span>
            </div>
            <div className="flex justify-between">
              <span className="text-renal-muted">Recent fever</span>
              <span className="text-rs-green">None</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};