import React from 'react';
import { Card } from '../../components/ui/Card';
import { TrendChart } from '../../components/charts/TrendChart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Patient } from '../../types';

interface VolumeBPTabProps {
  patient: Patient;
}

export const VolumeBPTab: React.FC<VolumeBPTabProps> = ({ patient }) => {
  // Generate session-based BP data (SBP over session duration)
  const bpData = [
    { x: 0, y: 148 },
    { x: 15, y: 145 },
    { x: 30, y: 143 },
    { x: 45, y: 140 },
    { x: 60, y: 138 },
    { x: 75, y: 135 },
    { x: 90, y: 133 },
    { x: 105, y: 132 },
    { x: 120, y: 130 },
    { x: 135, y: 128 },
    { x: 150, y: 126 },
    { x: 165, y: 125 },
    { x: 180, y: 123 },
    { x: 195, y: 122 },
    { x: 210, y: 120 },
    { x: 225, y: 118 },
    { x: 240, y: 115 },
  ];

  // Generate weight data (pre and post dialysis)
  const weightData = [
    { x: 'Mon', preWeight: 68.5, postWeight: 65.2 },
    { x: 'Wed', preWeight: 69.2, postWeight: 65.8 },
    { x: 'Fri', preWeight: 68.8, postWeight: 65.5 },
    { x: 'Mon', preWeight: 69.5, postWeight: 66.1 },
    { x: 'Wed', preWeight: 70.2, postWeight: 66.8 },
    { x: 'Fri', preWeight: 69.8, postWeight: 66.4 },
    { x: 'Mon', preWeight: 70.5, postWeight: 67.0 },
    { x: 'Wed', preWeight: 71.2, postWeight: 67.5 },
  ];

  // Calculate metrics based on patient archetype
  const isCrasher = patient.archetype.includes('Crasher');
  const meanIDWG = isCrasher ? 2.8 : 1.3;
  const meanUFR = isCrasher ? 12.5 : 5.6;
  const idhRate = isCrasher ? 45 : 8;
  const crampsRate = isCrasher ? 35 : 8;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-semibold text-renal-text mb-1">
          Volume and BP (history + predictive curve)
        </h2>
      </div>

      {/* SBP Chart with Metrics */}
      <Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2">
            <div className="h-80">
              <TrendChart
                data={bpData}
                title="Systolic BP During Session"
                yAxisLabel="SBP (mmHg)"
                color="#6366f1"
                targetValue={130}
                warningValue={140}
                criticalValue={90}
              />
            </div>
            <div className="mt-2 text-center">
              <span className="text-xs text-renal-muted">Minutes</span>
            </div>
          </div>

          {/* Metrics Panel */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-renal-text mb-4">Volume Metrics</h3>
            
            <div className="p-3 bg-renal-bg rounded-lg border border-renal-border">
              <div className="text-xs text-renal-muted mb-1">Mean IDWG</div>
              <div className="text-lg font-bold text-renal-text">{meanIDWG.toFixed(1)} kg</div>
            </div>

            <div className="p-3 bg-renal-bg rounded-lg border border-renal-border">
              <div className="text-xs text-renal-muted mb-1">Mean UFR</div>
              <div className="text-lg font-bold text-renal-text">{meanUFR.toFixed(1)} ml/kg/hr</div>
            </div>

            <div className="p-3 bg-renal-bg rounded-lg border border-renal-border">
              <div className="text-xs text-renal-muted mb-1">IDH Rate</div>
              <div className={`text-lg font-bold ${idhRate > 20 ? 'text-rs-red' : 'text-rs-green'}`}>
                {idhRate}%
              </div>
            </div>

            <div className="p-3 bg-renal-bg rounded-lg border border-renal-border">
              <div className="text-xs text-renal-muted mb-1">Cramps Rate</div>
              <div className={`text-lg font-bold ${crampsRate > 20 ? 'text-rs-amber' : 'text-rs-green'}`}>
                {crampsRate}%
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Weight Trajectory */}
      <Card>
        <h3 className="text-sm font-semibold text-renal-text mb-4">Weight Trajectory (Pre vs Post HD)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weightData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="gradientPre" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradientPost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2a3a" />
              <XAxis dataKey="x" stroke="#9aa8bb" fontSize={11} tickLine={false} axisLine={{ stroke: '#1e2a3a' }} />
              <YAxis stroke="#9aa8bb" fontSize={11} tickLine={false} axisLine={{ stroke: '#1e2a3a' }} domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-renal-panel border border-renal-border rounded-lg p-3 shadow-xl">
                        <p className="text-renal-text text-sm">{label}</p>
                        <p className="text-blue-500 text-sm">Pre: {payload[0]?.value} kg</p>
                        <p className="text-red-500 text-sm">Post: {payload[1]?.value} kg</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="preWeight" stroke="#3b82f6" strokeWidth={2} fill="url(#gradientPre)" dot={{ fill: '#3b82f6', strokeWidth: 0, r: 3 }} />
              <Area type="monotone" dataKey="postWeight" stroke="#ef4444" strokeWidth={2} fill="url(#gradientPost)" dot={{ fill: '#ef4444', strokeWidth: 0, r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs text-renal-muted">Pre-weight</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-renal-muted">Post-weight</span>
          </div>
        </div>
      </Card>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-xs text-renal-muted uppercase tracking-wider mb-2">Volume Status</div>
          <div className={`text-lg font-bold ${isCrasher ? 'text-rs-red' : 'text-rs-green'}`}>
            {isCrasher ? 'Overloaded' : 'Euvolemic'}
          </div>
          <div className="text-xs text-renal-muted mt-1">
            {isCrasher ? 'IDWG >5% body weight' : 'IDWG <3% body weight'}
          </div>
        </Card>

        <Card>
          <div className="text-xs text-renal-muted uppercase tracking-wider mb-2">BP Control</div>
          <div className={`text-lg font-bold ${isCrasher ? 'text-rs-amber' : 'text-rs-green'}`}>
            {isCrasher ? 'Labile' : 'Stable'}
          </div>
          <div className="text-xs text-renal-muted mt-1">
            {isCrasher ? 'Frequent IDH episodes' : 'No IDH episodes'}
          </div>
        </Card>

        <Card>
          <div className="text-xs text-renal-muted uppercase tracking-wider mb-2">Target Dry Weight</div>
          <div className="text-lg font-bold text-renal-text">
            65.0 kg
          </div>
          <div className="text-xs text-renal-muted mt-1">
            Last adjusted: 2 weeks ago
          </div>
        </Card>
      </div>
    </div>
  );
};
