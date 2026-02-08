import React, { useMemo, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { KPICard } from '../../components/ui/KPICard';
import { TrendChart } from '../../components/charts/TrendChart';
import { generateMockSessions } from '../../data/mockData';
import { cn } from '../../utils/cn';
import type { Patient } from '../../types';

interface SessionDataTabProps {
  patient: Patient;
}

export const SessionDataTab: React.FC<SessionDataTabProps> = ({ patient }) => {
  const sessions = useMemo(() => generateMockSessions(patient.id).slice(0, 5), [patient.id]);
  
  // Next Session Plan state
  const [nextSessionPlan, setNextSessionPlan] = useState({
    duration: 248,
    dialysateTemp: 36.44,
    ufVolume: 1.25,
    dialysateK: '2.5',
    sodiumProfiling: false,
  });
  
  // Calculate predicted metrics based on session plan
  const calculatePredictions = () => {
    const patientWeight = 65; // kg
    const ufr = (nextSessionPlan.ufVolume * 1000) / (nextSessionPlan.duration / 60); // ml/hr
    const ufrPerKg = ufr / patientWeight;
    
    // IDH probability increases with higher UFR
    const idhProb = Math.min(60, Math.round(ufrPerKg * 5 + (nextSessionPlan.duration < 240 ? 5 : 0)));
    
    // spKt/V calculation (simplified)
    const spktv = (0.45 * nextSessionPlan.duration / 60 + 0.8).toFixed(2);
    
    // Potassium direction based on dialysate K
    const potassiumDirection = parseFloat(nextSessionPlan.dialysateK) < 3 ? '-4.2' : '-2.1';
    
    return {
      ufr: ufrPerKg.toFixed(1),
      idhProb,
      spktv,
      potassiumDirection,
    };
  };
  
  const predictions = calculatePredictions();

  const stats = useMemo(() => {
    const completedSessions = sessions.filter(s => !s.terminatedEarly);
    const totalDuration = sessions.reduce((acc, s) => acc + s.duration, 0);
    const totalUF = sessions.reduce((acc, s) => acc + s.ufVolume, 0);
    const prematureCount = sessions.filter(s => s.terminatedEarly).length;
    
    const avgIDWG = sessions.reduce((acc, s) => acc + s.idwg, 0) / sessions.length;
    const idhEvents = sessions.filter(s => s.nadirSBP < 100).length;
    const crampingEvents = sessions.filter(s => s.events.includes('Cramping')).length;
    
    // Calculate BP variability (standard deviation)
    const sbpValues = sessions.map(s => s.nadirSBP);
    const meanSBP = sbpValues.reduce((a, b) => a + b, 0) / sbpValues.length;
    const variance = sbpValues.reduce((acc, val) => acc + Math.pow(val - meanSBP, 2), 0) / sbpValues.length;
    const bpVariability = Math.sqrt(variance).toFixed(1);
    
    // Calculate fluid overload risk score (0-100)
    // Based on: mean IDWG, IDH events, UF rate, post-HD weight achievement
    const meanUFVolume = (totalUF / sessions.length);
    const idwgScore = Math.min((avgIDWG / 3.5) * 30, 30); // Max 30 points
    const idhScore = (idhEvents / sessions.length) * 25; // Max 25 points
    const ufRateScore = (meanUFVolume / 4) * 20; // Max 20 points
    const fluidOverloadScore = Math.round(idwgScore + idhScore + ufRateScore + 15); // +15 base
    
    return {
      sessionsCompleted: completedSessions.length,
      meanDuration: Math.round(totalDuration / sessions.length),
      meanUFVolume: (totalUF / sessions.length).toFixed(1),
      prematureRate: ((prematureCount / sessions.length) * 100).toFixed(1),
      avgIDWG: avgIDWG.toFixed(1),
      idhRate: ((idhEvents / sessions.length) * 100).toFixed(1),
      crampingRate: ((crampingEvents / sessions.length) * 100).toFixed(1),
      meanNadirSBP: Math.round(sessions.reduce((acc, s) => acc + s.nadirSBP, 0) / sessions.length),
      meanPeakSBP: Math.round(sessions.reduce((acc, s) => acc + s.preSBP, 0) / sessions.length),
      bpVariability,
      fluidOverloadScore: Math.min(fluidOverloadScore, 100),
    };
  }, [sessions]);

  const bpTrendData = sessions.map((s) => ({
    x: s.date.slice(5),
    preSBP: s.preSBP,
    nadirSBP: s.nadirSBP,
    postSBP: s.postSBP,
  })).reverse();

  const threshold5Percent = 65 * 0.05;

  return (
    <div className="space-y-6">
      {/* Session Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          label="Sessions Completed"
          value={stats.sessionsCompleted}
          subtitle="Last 12 sessions"
        />
        <KPICard
          label="Mean Duration"
          value={`${stats.meanDuration} min`}
          subtitle={`Prescribed: ${patient.schedule.durationPerSession} min`}
          status={stats.meanDuration < patient.schedule.durationPerSession ? 'warning' : 'good'}
        />
        <KPICard
          label="Mean UF Volume"
          value={`${stats.meanUFVolume} L`}
          subtitle="Per session"
        />
        <KPICard
          label="Premature Termination"
          value={`${stats.prematureRate}%`}
          status={parseFloat(stats.prematureRate) > 10 ? 'warning' : 'good'}
        />
      </div>

      {/* Fluid Management KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          label="IDWG Mean"
          value={`${stats.avgIDWG} kg`}
          subtitle="Interdialytic weight gain"
          status={parseFloat(stats.avgIDWG) > threshold5Percent ? 'warning' : 'good'}
        />
        <KPICard
          label="IDH Event Rate"
          value={`${stats.idhRate}%`}
          subtitle="Intradialytic hypotension"
          status={parseFloat(stats.idhRate) > 30 ? 'critical' : parseFloat(stats.idhRate) > 15 ? 'warning' : 'good'}
        />
        <KPICard
          label="BP Variability"
          value={`${stats.bpVariability}`}
          subtitle="SBP standard deviation"
          status={parseFloat(stats.bpVariability) > 15 ? 'warning' : 'good'}
        />
        <KPICard
          label="Fluid Overload Risk"
          value={`${stats.fluidOverloadScore}%`}
          subtitle="Calculated risk score"
          status={stats.fluidOverloadScore > 70 ? 'critical' : stats.fluidOverloadScore > 50 ? 'warning' : 'good'}
        />
      </div>

      {/* Next Session Plan */}
      <Card className="p-4">
        <h3 className="text-base font-semibold text-renal-text mb-4">Next Session Plan</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Prescription Knobs */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Planned Duration */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-renal-muted">Duration (min)</label>
                  <span className="text-xs font-medium text-rs-red">{nextSessionPlan.duration}</span>
                </div>
                <input
                  type="range"
                  min="180"
                  max="300"
                  step="15"
                  value={nextSessionPlan.duration}
                  onChange={(e) => setNextSessionPlan(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full h-1.5 bg-renal-border rounded-lg appearance-none cursor-pointer accent-rs-red"
                />
              </div>

              {/* Dialysate Temp */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-renal-muted">Temp (°C)</label>
                  <span className="text-xs font-medium text-rs-red">{nextSessionPlan.dialysateTemp.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="35.0"
                  max="37.5"
                  step="0.1"
                  value={nextSessionPlan.dialysateTemp}
                  onChange={(e) => setNextSessionPlan(prev => ({ ...prev, dialysateTemp: parseFloat(e.target.value) }))}
                  className="w-full h-1.5 bg-renal-border rounded-lg appearance-none cursor-pointer accent-rs-red"
                />
              </div>
            </div>

            {/* Planned UF */}
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-renal-muted">UF Volume (L)</label>
                <span className="text-xs font-medium text-rs-red">{nextSessionPlan.ufVolume.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="4.0"
                step="0.05"
                value={nextSessionPlan.ufVolume}
                onChange={(e) => setNextSessionPlan(prev => ({ ...prev, ufVolume: parseFloat(e.target.value) }))}
                className="w-full h-1.5 bg-renal-border rounded-lg appearance-none cursor-pointer accent-rs-red"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Dialysate K */}
              <div>
                <label className="text-xs text-renal-muted mb-1 block">Dialysate K</label>
                <select
                  value={nextSessionPlan.dialysateK}
                  onChange={(e) => setNextSessionPlan(prev => ({ ...prev, dialysateK: e.target.value }))}
                  className="w-full p-1.5 bg-renal-bg border border-renal-border rounded text-renal-text text-xs"
                >
                  <option value="1.0">1.0</option>
                  <option value="2.0">2.0</option>
                  <option value="2.5">2.5</option>
                  <option value="3.0">3.0</option>
                  <option value="4.0">4.0</option>
                </select>
              </div>

              {/* Sodium Profiling */}
              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="sodiumProfiling"
                  checked={nextSessionPlan.sodiumProfiling}
                  onChange={(e) => setNextSessionPlan(prev => ({ ...prev, sodiumProfiling: e.target.checked }))}
                  className="w-3 h-3 rounded border-renal-border bg-renal-bg text-rs-blue"
                />
                <label htmlFor="sodiumProfiling" className="text-xs text-renal-muted">Sodium profiling</label>
              </div>
            </div>
          </div>

          {/* Right Side - Plan Preview */}
          <div>
            <h4 className="text-xs font-semibold text-renal-text mb-2">Predictions</h4>
            <div className="space-y-2 bg-renal-bg rounded-lg p-3 border border-renal-border">
              <div className="flex items-center justify-between text-xs">
                <span className="text-renal-muted">UFR</span>
                <span className="text-renal-text font-medium">{predictions.ufr} ml/kg/hr</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-renal-muted">IDH Probability</span>
                <span className={cn('font-medium', predictions.idhProb > 20 ? 'text-rs-red' : 'text-rs-green')}>{predictions.idhProb}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-renal-muted">spKt/V</span>
                <span className="text-renal-text font-medium">{predictions.spktv}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-renal-muted">K+ Direction</span>
                <span className="text-renal-text font-medium">{predictions.potassiumDirection}</span>
              </div>
            </div>

            <div className="mt-2 p-2 bg-rs-blue/10 border border-rs-blue/30 rounded text-xs text-renal-muted">
              <span className="text-rs-blue font-medium">Note:</span> Directional estimates based on plan settings.
            </div>
          </div>
        </div>
      </Card>

      {/* Hemodynamic Stability */}
      <Card>
        <h3 className="text-sm font-semibold text-renal-text mb-4">Hemodynamic Stability</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="p-3 bg-renal-bg rounded-lg">
            <div className="text-xs text-renal-muted mb-1">IDH Event Rate</div>
            <div className={cn(
              'text-lg font-bold',
              parseFloat(stats.idhRate) > 30 ? 'text-rs-red' : 'text-renal-text'
            )}>
              {stats.idhRate}%
            </div>
          </div>
          <div className="p-3 bg-renal-bg rounded-lg">
            <div className="text-xs text-renal-muted mb-1">Mean Nadir SBP</div>
            <div className={cn(
              'text-lg font-bold',
              stats.meanNadirSBP < 100 ? 'text-rs-amber' : 'text-renal-text'
            )}>
              {stats.meanNadirSBP} mmHg
            </div>
          </div>
          <div className="p-3 bg-renal-bg rounded-lg">
            <div className="text-xs text-renal-muted mb-1">BP Variability</div>
            <div className={cn(
              'text-lg font-bold',
              parseFloat(stats.bpVariability) > 15 ? 'text-rs-amber' : 'text-renal-text'
            )}>
              {stats.bpVariability}
            </div>
          </div>
          <div className="p-3 bg-renal-bg rounded-lg">
            <div className="text-xs text-renal-muted mb-1">Cramping Episodes</div>
            <div className={cn(
              'text-lg font-bold',
              parseFloat(stats.crampingRate) > 20 ? 'text-rs-amber' : 'text-renal-text'
            )}>
              {stats.crampingRate}%
            </div>
          </div>
        </div>

        <div className="h-48">
          <TrendChart
            data={bpTrendData.map(d => ({ x: d.x, y: d.nadirSBP }))}
            title="Blood Pressure Trajectory (Nadir SBP)"
            warningValue={100}
            color="#ff4d4f"
          />
        </div>
        
        {parseFloat(stats.idhRate) > 30 && (
          <div className="mt-4 p-3 bg-rs-red/10 border border-rs-red/30 rounded-lg">
            <p className="text-sm text-rs-red">
              ⚠️ Recurrent IDH pattern detected (≥30% of sessions). Consider midodrine or UF rate reduction.
            </p>
          </div>
        )}
      </Card>

      {/* Session Event Log */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-renal-text">Session Event Log (Last 12 Sessions)</h3>
          <div className="flex gap-2">
            <select className="bg-renal-bg border border-renal-border rounded-lg px-3 py-1.5 text-sm text-renal-text">
              <option>All Events</option>
              <option>Hypotension</option>
              <option>Cramping</option>
              <option>Early Termination</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-renal-border">
                <th className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase">Duration</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase">UF Volume</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase">Pre Weight</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase">Post Weight</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase">IDWG</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase">Nadir SBP</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase">Events</th>
              </tr>
            </thead>
            <tbody>
              {sessions.slice(0, 10).map((session, idx) => (
                <tr key={idx} className="border-b border-renal-border/50 hover:bg-white/5">
                  <td className="px-4 py-3 text-sm text-renal-text">{session.date}</td>
                  <td className={cn(
                    'px-4 py-3 text-sm',
                    session.terminatedEarly ? 'text-rs-red' : 'text-renal-text'
                  )}>
                    {session.duration} min
                  </td>
                  <td className="px-4 py-3 text-sm text-renal-text">{session.ufVolume} L</td>
                  <td className="px-4 py-3 text-sm text-renal-text">{session.preWeight} kg</td>
                  <td className="px-4 py-3 text-sm text-renal-text">{session.postWeight} kg</td>
                  <td className="px-4 py-3 text-sm text-renal-text">{session.idwg} kg</td>
                  <td className={cn(
                    'px-4 py-3 text-sm',
                    session.nadirSBP < 100 ? 'text-rs-red' : 'text-renal-text'
                  )}>
                    {session.nadirSBP} mmHg
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {session.events.length > 0 ? (
                      <span className="text-rs-amber">{session.events.join(', ')}</span>
                    ) : (
                      <span className="text-rs-green">None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};