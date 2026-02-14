import React from 'react';
import { TrendingDown, TrendingUp, ShieldAlert } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { KPICard } from '../../components/ui/KPICard';
import { Sparkline } from '../../components/charts/Sparkline';
import { CausalPathwayVisualization } from '../../components/charts/CausalPathwayVisualization';

import { cn } from '../../utils/cn';
import type { Patient } from '../../types';
import { api } from '../../services/api';
import type { LeverState, MediatorScores } from '../../components/layout/CopilotLevers';

interface OverviewTabProps {
  patient: Patient;
  mediators?: MediatorScores | null;
  activeLevers?: LeverState | null;
  isChatOpen?: boolean;
}

// Calculate mortality reduction based on mediator changes (Fallback)
const calculateMortalityDelta = (
  mediators: MediatorScores | null | undefined
): { '30d': number; '90d': number; '1yr': number } => {
  if (!mediators) return { '30d': 0, '90d': 0, '1yr': 0 };

  // Calculate reduction based on key mediators
  // IDH burden and Volume stress have the biggest impact on short-term mortality
  const idhReduction = (0.58 - mediators['IDH burden']) * 15; // Up to ~8.7% reduction
  const volumeReduction = (0.65 - mediators['Volume/UFR stress']) * 8; // Up to ~5.2% reduction
  const accessReduction = (0.48 - mediators['Access failure risk']) * 3; // Up to ~1.4% reduction

  const total30dReduction = idhReduction + volumeReduction + accessReduction;
  const total90dReduction = total30dReduction * 1.5;
  const total1yrReduction = total90dReduction * 1.2;

  return {
    '30d': Math.max(0, total30dReduction),
    '90d': Math.max(0, total90dReduction),
    '1yr': Math.max(0, total1yrReduction),
  };
};

export const OverviewTab: React.FC<OverviewTabProps> = ({ patient, mediators, activeLevers, isChatOpen }) => {
  // No longer using random generator for sparklines

  const [prediction, setPrediction] = React.useState<any>(null);
  const [isPredicting, setIsPredicting] = React.useState(false);

  // Debounced Prediction Call
  React.useEffect(() => {
    if (!activeLevers) return;

    //Check if any lever is active
    const hasActiveLevers = Object.values(activeLevers).some(v => v);
    if (!hasActiveLevers) {
      setPrediction(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsPredicting(true);
      try {
        const result = await api.predictImpact(patient, activeLevers);
        setPrediction(result);
      } catch (e) {
        console.error(e);
      } finally {
        setIsPredicting(false);
      }
    }, 1000); // 1s debounce

    return () => clearTimeout(timer);
  }, [activeLevers, patient]);

  // Use LLM prediction if available, otherwise fallback to formula
  const deltaChanges = prediction ? {
    '30d': patient.mortalityRisk['30d'] - (prediction.mortalityRisk30d ?? patient.mortalityRisk['30d']),
    '90d': patient.mortalityRisk['90d'] - (prediction.mortalityRisk90d ?? patient.mortalityRisk['90d']),
    '1yr': patient.mortalityRisk['1yr'] - (prediction.mortalityRisk1yr ?? patient.mortalityRisk['1yr']),
  } : calculateMortalityDelta(mediators);

  const hasInterventions = activeLevers ? Object.values(activeLevers).some(v => v) : (mediators && (
    mediators['IDH burden'] < 0.58 ||
    mediators['Volume/UFR stress'] < 0.65 ||
    mediators['Access failure risk'] < 0.48
  ));

  // Calculate hospitalization risk reduction
  const hospitalizationReduction = prediction ? {
    '30d': patient.hospitalizationRisk['30d'] - (prediction.hospitalizationRisk30d ?? patient.hospitalizationRisk['30d']),
    '90d': 0 // Not returned by API yet
  } : {
    '30d': deltaChanges['30d'] * 0.8,
    '90d': deltaChanges['90d'] * 0.8,
  };

  // Real data for sparklines
  const mortalitySparkData = (patient.labs || []).filter(l => l.name === 'Albumin').map(l => l.value).reverse();
  const hospSparkData = (patient.sessions || []).map(s => s.idwg || 0).reverse();


  return (
    <div className="space-y-6">
      {/* Risk KPIs with Delta Changes - responsive columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="md:col-span-2 lg:col-span-4 flex justify-end">
          <Badge variant="default" className={cn(
            "text-xs gap-1",
            prediction ? "border-rs-green text-rs-green bg-rs-green/5" : "border-renal-muted text-renal-muted"
          )}>
            {isPredicting ? (
              <>
                <span className="animate-pulse">●</span> Predicting...
              </>
            ) : prediction ? (
              <>
                <span>🤖</span> AI Analysis
              </>
            ) : (
              <>
                <span>⚡</span> Standard Rule-Based
              </>
            )}
          </Badge>
        </div>

        {/* 30d Hospitalization */}
        <KPICard
          label="30-Day Hospitalization"
          value={`${patient.hospitalizationRisk['30d'].toFixed(1)}%`}
          subtitle={patient.hospitalizationRisk['30d'] > 20 ? 'High Risk' : patient.hospitalizationRisk['30d'] > 10 ? 'Medium Risk' : 'Low Risk'}
          status={patient.hospitalizationRisk['30d'] > 20 ? 'critical' : patient.hospitalizationRisk['30d'] > 10 ? 'warning' : 'good'}
        >
          <div className="mt-2 overflow-hidden">
            <Sparkline data={hospSparkData.length > 0 ? hospSparkData : [18, 22, 19, 21]} width="100%" height={40} color={patient.hospitalizationRisk['30d'] > 20 ? '#ff4d4f' : patient.hospitalizationRisk['30d'] > 10 ? '#ffb020' : '#23d18b'} />
          </div>

          {/* Delta Change from Interventions */}
          {hasInterventions && (
            <div className={`mt-3 p-2 bg-rs-green/10 border border-rs-green/30 rounded-lg transition-opacity duration-300 ${isPredicting ? 'opacity-50' : 'opacity-100'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-renal-muted">{isPredicting ? 'Predicting...' : 'With Interventions:'}</span>
                <span className="text-sm font-bold text-rs-green">
                  {prediction
                    ? `${(prediction.hospitalizationRisk30d ?? patient.hospitalizationRisk['30d']).toFixed(1)}%`
                    : `${Math.max(0, patient.hospitalizationRisk['30d'] - hospitalizationReduction['30d']).toFixed(1)}%`
                  }
                </span>
              </div>
              {!isPredicting && hospitalizationReduction['30d'] > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-rs-green">↓</span>
                  <span className="text-xs text-rs-green font-medium">{hospitalizationReduction['30d'].toFixed(1)}% reduction</span>
                </div>
              )}
              {!isPredicting && hospitalizationReduction['30d'] < 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-rs-red">↑</span>
                  <span className="text-xs text-rs-red font-medium">+{Math.abs(hospitalizationReduction['30d']).toFixed(1)}% increase</span>
                </div>
              )}
            </div>
          )}
        </KPICard>

        {/* 30d Mortality */}
        <KPICard
          label="30-Day Mortality"
          value={`${patient.mortalityRisk['30d'].toFixed(1)}%`}
          subtitle={patient.mortalityRisk['30d'] > 20 ? 'High Risk' : patient.mortalityRisk['30d'] > 10 ? 'Medium Risk' : 'Low Risk'}
          delta={{
            value: Math.abs(patient.mortalityDelta['30d']),
            direction: patient.mortalityDelta['30d'] > 0 ? 'up' : 'down',
          }}
          status={patient.mortalityRisk['30d'] > 20 ? 'critical' : patient.mortalityRisk['30d'] > 10 ? 'warning' : 'good'}
        >
          <div className="mt-2 overflow-hidden">
            <Sparkline data={mortalitySparkData.length > 0 ? mortalitySparkData : [12, 11, 13, 12]} width="100%" height={40} color={patient.mortalityRisk['30d'] > 20 ? '#ff4d4f' : patient.mortalityRisk['30d'] > 10 ? '#ffb020' : '#23d18b'} />
          </div>

          {/* Delta Change from Interventions */}
          {hasInterventions && (
            <div className={`mt-3 p-2 bg-rs-green/10 border border-rs-green/30 rounded-lg transition-opacity duration-300 ${isPredicting ? 'opacity-50' : 'opacity-100'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-renal-muted">{isPredicting ? 'Predicting...' : 'With Interventions:'}</span>
                <span className="text-sm font-bold text-rs-green">{Math.max(0, patient.mortalityRisk['30d'] - deltaChanges['30d']).toFixed(1)}%</span>
              </div>
              {!isPredicting && deltaChanges['30d'] > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-rs-green">↓</span>
                  <span className="text-xs text-rs-green font-medium">{deltaChanges['30d'].toFixed(1)}% reduction</span>
                </div>
              )}
              {!isPredicting && deltaChanges['30d'] < 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-rs-red">↑</span>
                  <span className="text-xs text-rs-red font-medium">+{Math.abs(deltaChanges['30d']).toFixed(1)}% increase</span>
                </div>
              )}
            </div>
          )}
        </KPICard>

        {/* 90d Mortality */}
        <KPICard
          label="90-Day Mortality"
          value={`${patient.mortalityRisk['90d'].toFixed(1)}%`}
          subtitle={patient.mortalityRisk['90d'] > 20 ? 'High Risk' : patient.mortalityRisk['90d'] > 10 ? 'Medium Risk' : 'Low Risk'}
          delta={{
            value: Math.abs(patient.mortalityDelta['90d']),
            direction: patient.mortalityDelta['90d'] > 0 ? 'up' : 'down',
          }}
          status={patient.mortalityRisk['90d'] > 20 ? 'critical' : patient.mortalityRisk['90d'] > 10 ? 'warning' : 'good'}
        >
          <div className="mt-2 overflow-hidden">
            <Sparkline data={mortalitySparkData.length > 0 ? mortalitySparkData : [15, 14, 16, 15]} width="100%" height={40} color={patient.mortalityRisk['90d'] > 20 ? '#ff4d4f' : patient.mortalityRisk['90d'] > 10 ? '#ffb020' : '#23d18b'} />
          </div>

          {/* Delta Change from Interventions */}
          {hasInterventions && (
            <div className={`mt-3 p-2 bg-rs-green/10 border border-rs-green/30 rounded-lg transition-opacity duration-300 ${isPredicting ? 'opacity-50' : 'opacity-100'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-renal-muted">{isPredicting ? 'Predicting...' : 'With Interventions:'}</span>
                <span className="text-sm font-bold text-rs-green">{Math.max(0, patient.mortalityRisk['90d'] - deltaChanges['90d']).toFixed(1)}%</span>
              </div>
              {!isPredicting && deltaChanges['90d'] > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-rs-green">↓</span>
                  <span className="text-xs text-rs-green font-medium">{deltaChanges['90d'].toFixed(1)}% reduction</span>
                </div>
              )}
              {!isPredicting && deltaChanges['90d'] < 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-rs-red">↑</span>
                  <span className="text-xs text-rs-red font-medium">+{Math.abs(deltaChanges['90d']).toFixed(1)}% increase</span>
                </div>
              )}
            </div>
          )}
        </KPICard>

        {/* 1yr Mortality */}
        <KPICard
          label="1-Year Mortality"
          value={`${patient.mortalityRisk['1yr'].toFixed(1)}%`}
          subtitle={patient.mortalityRisk['1yr'] > 20 ? 'High Risk' : patient.mortalityRisk['1yr'] > 10 ? 'Medium Risk' : 'Low Risk'}
          delta={{
            value: Math.abs(patient.mortalityDelta['1yr']),
            direction: patient.mortalityDelta['1yr'] > 0 ? 'up' : 'down',
          }}
          status={patient.mortalityRisk['1yr'] > 20 ? 'critical' : patient.mortalityRisk['1yr'] > 10 ? 'warning' : 'good'}
        >
          <div className="mt-2 overflow-hidden">
            <Sparkline data={mortalitySparkData.length > 0 ? mortalitySparkData : [25, 24, 26, 25]} width="100%" height={40} color={patient.mortalityRisk['1yr'] > 20 ? '#ff4d4f' : patient.mortalityRisk['1yr'] > 10 ? '#ffb020' : '#23d18b'} />
          </div>

          {/* Delta Change from Interventions */}
          {hasInterventions && (
            <div className={`mt-3 p-2 bg-rs-green/10 border border-rs-green/30 rounded-lg transition-opacity duration-300 ${isPredicting ? 'opacity-50' : 'opacity-100'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-renal-muted">{isPredicting ? 'Predicting...' : 'With Interventions:'}</span>
                <span className="text-sm font-bold text-rs-green">{Math.max(0, patient.mortalityRisk['1yr'] - deltaChanges['1yr']).toFixed(1)}%</span>
              </div>
              {!isPredicting && deltaChanges['1yr'] > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-rs-green">↓</span>
                  <span className="text-xs text-rs-green font-medium">{deltaChanges['1yr'].toFixed(1)}% reduction</span>
                </div>
              )}
              {!isPredicting && deltaChanges['1yr'] < 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-rs-red">↑</span>
                  <span className="text-xs text-rs-red font-medium">+{Math.abs(deltaChanges['1yr']).toFixed(1)}% increase</span>
                </div>
              )}
            </div>
          )}
        </KPICard>
      </div>

      {/* Critical Alerts and Intervention Impact - Side by Side */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Critical Alerts */}
        <div className="flex-1">
          <Card className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-rs-red" />
              <h3 className="text-base font-semibold text-renal-text">Critical Alerts</h3>
              <Badge variant="default" className="ml-auto border-rs-red text-rs-red">
                {patient.alerts.filter(a => a.severity === 'critical').length} Critical
              </Badge>
            </div>

            <div className="flex-1">
              <table className="w-full text-sm">
                <thead className="text-xs text-renal-muted uppercase bg-renal-surface border-b border-renal-border">
                  <tr>
                    <th className="px-3 py-2 text-left">Alert Type</th>
                    <th className="px-3 py-2 text-left">Description</th>
                    <th className="px-3 py-2 text-center">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-renal-border">
                  {patient.alerts.length > 0 ? (
                    patient.alerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-renal-surface/50">
                        <td className="px-3 py-2 font-medium text-renal-text">{alert.type}</td>
                        <td className="px-3 py-2 text-renal-muted">{alert.description}</td>
                        <td className="px-3 py-2 text-center">
                          <Badge
                            variant="default"
                            className={cn(
                              'text-xs',
                              alert.severity === 'critical' ? 'border-rs-red text-rs-red' :
                                alert.severity === 'warning' ? 'border-rs-amber text-rs-amber' :
                                  'border-rs-blue text-rs-blue'
                            )}
                          >
                            {alert.severity}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-3 py-4 text-center text-renal-muted">
                        No active alerts
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Intervention Impact Summary */}
        <div className="flex-1">
          <Card className={cn(
            "h-full flex flex-col",
            hasInterventions ? "bg-rs-green/5 border-rs-green/20" : ""
          )}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-rs-green/20 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-rs-green" />
              </div>
              <h3 className="text-base font-semibold text-renal-text">Intervention Impact</h3>
              {hasInterventions && (
                <Badge variant="default" className="ml-auto border-rs-green text-rs-green">
                  Active
                </Badge>
              )}
            </div>

            <div className="flex-1">
              {hasInterventions ? (
                <table className="w-full text-sm">
                  <thead className="text-xs text-renal-muted uppercase bg-renal-surface border-b border-renal-border">
                    <tr>
                      <th className="px-3 py-2 text-left">Risk Metric</th>
                      <th className="px-3 py-2 text-center">Before</th>
                      <th className="px-3 py-2 text-center">After</th>
                      <th className="px-3 py-2 text-center">Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-renal-border">
                    <tr className="hover:bg-renal-surface/50">
                      <td className="px-3 py-2 font-medium text-renal-text">30d Mortality</td>
                      <td className="px-3 py-2 text-center text-renal-muted">{patient.mortalityRisk['30d'].toFixed(1)}%</td>
                      <td className="px-3 py-2 text-center font-semibold text-rs-green">
                        {Math.max(0, patient.mortalityRisk['30d'] - deltaChanges['30d']).toFixed(1)}%
                      </td>
                      <td className="px-3 py-2 text-center">
                        {deltaChanges['30d'] > 0 ? (
                          <span className="inline-flex items-center gap-1 text-rs-green font-medium">
                            <TrendingDown className="w-3 h-3" />
                            -{deltaChanges['30d'].toFixed(1)}%
                          </span>
                        ) : deltaChanges['30d'] < 0 ? (
                          <span className="inline-flex items-center gap-1 text-rs-red font-medium">
                            <TrendingUp className="w-3 h-3" />
                            +{Math.abs(deltaChanges['30d']).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-renal-muted">-</span>
                        )}
                      </td>
                    </tr>
                    <tr className="hover:bg-renal-surface/50">
                      <td className="px-3 py-2 font-medium text-renal-text">90d Mortality</td>
                      <td className="px-3 py-2 text-center text-renal-muted">{patient.mortalityRisk['90d'].toFixed(1)}%</td>
                      <td className="px-3 py-2 text-center font-semibold text-rs-green">
                        {Math.max(0, patient.mortalityRisk['90d'] - deltaChanges['90d']).toFixed(1)}%
                      </td>
                      <td className="px-3 py-2 text-center">
                        {deltaChanges['90d'] > 0 ? (
                          <span className="inline-flex items-center gap-1 text-rs-green font-medium">
                            <TrendingDown className="w-3 h-3" />
                            -{deltaChanges['90d'].toFixed(1)}%
                          </span>
                        ) : deltaChanges['90d'] < 0 ? (
                          <span className="inline-flex items-center gap-1 text-rs-red font-medium">
                            <TrendingUp className="w-3 h-3" />
                            +{Math.abs(deltaChanges['90d']).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-renal-muted">-</span>
                        )}
                      </td>
                    </tr>
                    <tr className="hover:bg-renal-surface/50">
                      <td className="px-3 py-2 font-medium text-renal-text">1yr Mortality</td>
                      <td className="px-3 py-2 text-center text-renal-muted">{patient.mortalityRisk['1yr'].toFixed(1)}%</td>
                      <td className="px-3 py-2 text-center font-semibold text-rs-green">
                        {Math.max(0, patient.mortalityRisk['1yr'] - deltaChanges['1yr']).toFixed(1)}%
                      </td>
                      <td className="px-3 py-2 text-center">
                        {deltaChanges['1yr'] > 0 ? (
                          <span className="inline-flex items-center gap-1 text-rs-green font-medium">
                            <TrendingDown className="w-3 h-3" />
                            -{deltaChanges['1yr'].toFixed(1)}%
                          </span>
                        ) : deltaChanges['1yr'] < 0 ? (
                          <span className="inline-flex items-center gap-1 text-rs-red font-medium">
                            <TrendingUp className="w-3 h-3" />
                            +{Math.abs(deltaChanges['1yr']).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-renal-muted">-</span>
                        )}
                      </td>
                    </tr>
                    <tr className="hover:bg-renal-surface/50">
                      <td className="px-3 py-2 font-medium text-renal-text">30d Hospitalization</td>
                      <td className="px-3 py-2 text-center text-renal-muted">{patient.hospitalizationRisk['30d'].toFixed(1)}%</td>
                      <td className="px-3 py-2 text-center font-semibold text-rs-green">
                        {Math.max(0, patient.hospitalizationRisk['30d'] - hospitalizationReduction['30d']).toFixed(1)}%
                      </td>
                      <td className="px-3 py-2 text-center">
                        {hospitalizationReduction['30d'] > 0 ? (
                          <span className="inline-flex items-center gap-1 text-rs-green font-medium">
                            <TrendingDown className="w-3 h-3" />
                            -{hospitalizationReduction['30d'].toFixed(1)}%
                          </span>
                        ) : hospitalizationReduction['30d'] < 0 ? (
                          <span className="inline-flex items-center gap-1 text-rs-red font-medium">
                            <TrendingUp className="w-3 h-3" />
                            +{Math.abs(hospitalizationReduction['30d']).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-renal-muted">-</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <div className="flex items-center justify-center h-full text-renal-muted text-sm">
                  No active interventions. Toggle levers below to see impact.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Recommendations and Causal Pathway - Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Recommendations */}
        <Card className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-renal-text">Top 5 Recommendations</h3>
              <p className="text-xs text-renal-muted">Ranked by expected mortality reduction</p>
            </div>
          </div>

          <div className="space-y-3">
            {(patient.recommendations && patient.recommendations.length > 0) ? (
              patient.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-start gap-4 p-3 rounded-lg border border-renal-border hover:border-rs-blue/50 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-rs-blue/10 flex items-center justify-center text-rs-blue font-bold text-sm">
                    {rec.rank}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-renal-text">{rec.description}</h4>
                        <p className="text-xs text-renal-muted mt-0.5">
                          Targets: <span className="text-rs-blue">{rec.targetMediator}</span>
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-rs-green">-{rec.expectedMortalityReduction}%</div>
                        <div className="text-xs text-renal-muted">mortality</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      <Badge
                        variant="default"
                        className={cn(
                          'text-xs',
                          rec.feasibility === 'Easy' ? 'border-rs-green text-rs-green' :
                            rec.feasibility === 'Moderate' ? 'border-rs-amber text-rs-amber' :
                              'border-rs-red text-rs-red'
                        )}
                      >
                        {rec.feasibility}
                      </Badge>
                      <Badge
                        variant="default"
                        className={cn(
                          'text-xs',
                          rec.urgency === 'Urgent' ? 'border-rs-red text-rs-red' : 'border-rs-blue text-rs-blue'
                        )}
                      >
                        {rec.urgency}
                      </Badge>
                      <span className="text-xs text-renal-muted">{rec.category}</span>
                      <Button variant="secondary" size="sm" className="ml-auto">
                        Assign
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-renal-muted">
                <p className="mb-2">Generating AI Recommendations...</p>
                <p className="text-xs">Analyzing patient history, labs, and vitals.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Causal Pathway Visualization */}
        <div className="h-full">
          <CausalPathwayVisualization patient={patient} isChatOpen={isChatOpen} />
        </div>
      </div>
    </div>
  );
};
