import React, { useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { KPICard } from '../../components/ui/KPICard';
import { TrendChart } from '../../components/charts/TrendChart';
import { BarChartComponent } from '../../components/charts/BarChart';
import { generateMockSessions } from '../../data/mockData';
import { cn } from '../../utils/cn';
import type { Patient } from '../../types';

interface AdequacyTabProps {
  patient: Patient;
}

export const AdequacyTab: React.FC<AdequacyTabProps> = ({ patient }) => {
  const sessions = useMemo(() => generateMockSessions(patient.id).slice(0, 30), [patient.id]);

  const stats = useMemo(() => {
    const recentSessions = sessions.slice(0, 6);
    const meanSpKtV = recentSessions.reduce((acc, s) => acc + s.spktv, 0) / recentSessions.length;
    const deliveredRatio = (recentSessions.filter(s => !s.terminatedEarly).length / recentSessions.length) * 100;
    const missedRate = ((sessions.filter(s => s.terminatedEarly).length / sessions.length) * 100);
    const meanBFR = sessions.reduce((acc, s) => acc + s.bfr, 0) / sessions.length;

    return {
      meanSpKtV: meanSpKtV.toFixed(2),
      deliveredRatio: deliveredRatio.toFixed(0),
      missedRate: missedRate.toFixed(1),
      meanBFR: Math.round(meanBFR),
    };
  }, [sessions]);

  const spktvTrendData = sessions.map((s) => ({
    x: s.date.slice(5),
    y: s.spktv,
  })).reverse();

  const adequacyDrivers = [
    { name: 'Session time shortfall', value: 35, color: '#ff4d4f' },
    { name: 'Blood flow reduction', value: 28, color: '#ffb020' },
    { name: 'Access flow limitation', value: 22, color: '#2f7df6' },
    { name: 'Clotting/recirculation', value: 10, color: '#8b5cf6' },
    { name: 'Missed sessions', value: 5, color: '#23d18b' },
  ];

  return (
    <div className="space-y-6">
      {/* Adequacy KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          label="Mean spKt/V"
          value={stats.meanSpKtV}
          subtitle="Last 6 sessions"
          status={parseFloat(stats.meanSpKtV) >= 1.4 ? 'good' : parseFloat(stats.meanSpKtV) >= 1.2 ? 'warning' : 'critical'}
        />
        <KPICard
          label="Delivered Ratio"
          value={`${stats.deliveredRatio}%`}
          subtitle="Target: >90%"
          status={parseFloat(stats.deliveredRatio) >= 90 ? 'good' : parseFloat(stats.deliveredRatio) >= 85 ? 'warning' : 'critical'}
        />
        <KPICard
          label="Missed Session Rate"
          value={`${stats.missedRate}%`}
          subtitle="Target: <5%"
          status={parseFloat(stats.missedRate) < 5 ? 'good' : parseFloat(stats.missedRate) < 10 ? 'warning' : 'critical'}
        />
        <KPICard
          label="Mean Blood Flow"
          value={`${stats.meanBFR} mL/min`}
          subtitle="Target: 300-400"
          status={parseFloat(stats.meanBFR.toString()) >= 300 ? 'good' : 'warning'}
        />
      </div>

      {/* spKt/V Trend and Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-renal-text mb-4">spKt/V Trend Analysis</h3>
          <div className="h-64">
            <TrendChart
              data={spktvTrendData}
              targetValue={1.4}
              warningValue={1.2}
              color="#2f7df6"
            />
          </div>
          {parseFloat(stats.meanSpKtV) < 1.2 && (
            <div className="mt-4 p-3 bg-rs-red/10 border border-rs-red/30 rounded-lg">
              <p className="text-sm text-rs-red">
                ⚠️ Warning: spKt/V below 1.2 for 2+ consecutive sessions
              </p>
            </div>
          )}
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-renal-text mb-4">Adequacy Drivers</h3>
          <div className="h-64">
            <BarChartComponent
              data={adequacyDrivers}
              horizontal
            />
          </div>
          <div className="mt-4 p-3 bg-renal-bg rounded-lg">
            <div className="text-xs text-renal-muted mb-1">Cumulative Adequacy Debt</div>
            <div className="text-lg font-bold text-rs-amber">2.4 units</div>
          </div>
        </Card>
      </div>

      {/* Delivery Performance Table */}
      <Card>
        <h3 className="text-sm font-semibold text-renal-text mb-4">Delivery Performance (Recent Sessions)</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-renal-border">
                <th className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase">Prescribed Time</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase">Delivered Time</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase">Prescribed BFR</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase">Delivered BFR</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase">spKt/V</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase">Delivery Ratio</th>
              </tr>
            </thead>
            <tbody>
              {sessions.slice(0, 10).map((session, idx) => {
                const deliveryRatio = ((session.duration / session.prescribedDuration) * 100).toFixed(0);
                return (
                  <tr key={idx} className="border-b border-renal-border/50 hover:bg-white/5">
                    <td className="px-4 py-3 text-sm text-renal-text">{session.date}</td>
                    <td className="px-4 py-3 text-sm text-renal-text">{session.prescribedDuration} min</td>
                    <td className={cn(
                      'px-4 py-3 text-sm',
                      session.duration < session.prescribedDuration ? 'text-rs-amber' : 'text-renal-text'
                    )}>
                      {session.duration} min
                    </td>
                    <td className="px-4 py-3 text-sm text-renal-text">300 mL/min</td>
                    <td className={cn(
                      'px-4 py-3 text-sm',
                      session.bfr < 300 ? 'text-rs-amber' : 'text-renal-text'
                    )}>
                      {session.bfr} mL/min
                    </td>
                    <td className={cn(
                      'px-4 py-3 text-sm font-mono',
                      session.spktv < 1.2 ? 'text-rs-red' : session.spktv < 1.4 ? 'text-rs-amber' : 'text-rs-green'
                    )}>
                      {session.spktv.toFixed(2)}
                    </td>
                    <td className={cn(
                      'px-4 py-3 text-sm font-bold',
                      parseFloat(deliveryRatio) < 85 ? 'text-rs-red' : parseFloat(deliveryRatio) < 90 ? 'text-rs-amber' : 'text-rs-green'
                    )}>
                      {deliveryRatio}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-rs-green" />
            <span className="text-renal-muted">Meets target</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-rs-amber" />
            <span className="text-renal-muted">Approaching</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-rs-red" />
            <span className="text-renal-muted">Below target</span>
          </div>
        </div>
      </Card>
    </div>
  );
};