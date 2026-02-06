import React, { useState } from 'react';
import { ArrowDown, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { KPICard } from '../../components/ui/KPICard';
import { Sparkline } from '../../components/charts/Sparkline';
import { CausalPathwayVisualization } from '../../components/charts/CausalPathwayVisualization';
import { mockRecommendations, generateSparklineData } from '../../data/mockData';
import { cn } from '../../utils/cn';
import type { Patient, AlertSeverity } from '../../types';

interface OverviewTabProps {
  patient: Patient;
}

const getAlertIcon = (severity: AlertSeverity) => {
  switch (severity) {
    case 'critical':
      return <AlertTriangle className="w-5 h-5 text-rs-red" />;
    case 'warning':
      return <AlertCircle className="w-5 h-5 text-rs-amber" />;
    case 'info':
      return <Info className="w-5 h-5 text-rs-blue" />;
  }
};

const getAlertBg = (severity: AlertSeverity) => {
  switch (severity) {
    case 'critical':
      return 'bg-rs-red/10 border-rs-red/30';
    case 'warning':
      return 'bg-rs-amber/10 border-rs-amber/30';
    case 'info':
      return 'bg-rs-blue/10 border-rs-blue/30';
  }
};

export const OverviewTab: React.FC<OverviewTabProps> = ({ patient }) => {
  const sparklineData = generateSparklineData(12);
  
  // Simulator state
  const [simulatorState, setSimulatorState] = useState({
    reduceWeight: { enabled: true, value: -0.5 },
    increaseTime: { enabled: false, value: 240 },
    accessEval: { enabled: true },
    adjustBFR: { enabled: false, value: 300 },
  });

  // Calculate simulation results based on interventions
  const calculateSimulation = () => {
    let mortalityReduction = 0;
    let fluidOverloadReduction = 0;
    let accessRiskReduction = 0;
    
    if (simulatorState.reduceWeight.enabled) {
      const weightImpact = Math.abs(simulatorState.reduceWeight.value) * 2.5;
      mortalityReduction += weightImpact;
      fluidOverloadReduction += weightImpact * 8;
    }
    
    if (simulatorState.increaseTime.enabled) {
      const timeIncrease = simulatorState.increaseTime.value - 240;
      const timeImpact = (timeIncrease / 15) * 1.2;
      mortalityReduction += timeImpact;
    }
    
    if (simulatorState.accessEval.enabled) {
      mortalityReduction += 2.1;
      accessRiskReduction += 14;
    }
    
    if (simulatorState.adjustBFR.enabled) {
      const bfrIncrease = simulatorState.adjustBFR.value - 300;
      mortalityReduction += (bfrIncrease / 25) * 0.8;
    }
    
    return {
      mortality90d: Math.max(0, patient.mortalityRisk['90d'] - mortalityReduction),
      fluidOverload: Math.max(0, 78 - fluidOverloadReduction),
      accessRisk: Math.max(0, 72 - accessRiskReduction),
    };
  };

  const simulationResults = calculateSimulation();

  const handleReset = () => {
    setSimulatorState({
      reduceWeight: { enabled: false, value: -0.5 },
      increaseTime: { enabled: false, value: 240 },
      accessEval: { enabled: false },
      adjustBFR: { enabled: false, value: 300 },
    });
  };

  return (
    <div className="space-y-6">
      {/* Mortality Risk KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['30d', '90d', '1yr'] as const).map((period) => (
          <KPICard
            key={period}
            label={`${period === '30d' ? '30-Day' : period === '90d' ? '90-Day' : '1-Year'} Mortality`}
            value={`${patient.mortalityRisk[period].toFixed(1)}%`}
            subtitle={patient.mortalityRisk[period] > 20 ? 'High Risk' : patient.mortalityRisk[period] > 10 ? 'Medium Risk' : 'Low Risk'}
            delta={{
              value: Math.abs(patient.mortalityDelta[period]),
              direction: patient.mortalityDelta[period] > 0 ? 'up' : 'down',
            }}
            status={patient.mortalityRisk[period] > 20 ? 'critical' : patient.mortalityRisk[period] > 10 ? 'warning' : 'good'}
          >
            <div className="mt-2">
              <Sparkline data={sparklineData} width={200} height={40} color={patient.mortalityRisk[period] > 20 ? '#ff4d4f' : patient.mortalityRisk[period] > 10 ? '#ffb020' : '#23d18b'} />
            </div>
          </KPICard>
        ))}
      </div>

      {/* Risk Profile and Causal Pathway */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Risk Profile */}
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-renal-text mb-4">Risk Profile</h3>
          
          <div className="mb-4">
            <h4 className="text-xs font-medium text-renal-muted uppercase tracking-wider mb-2">Phenotype Factors</h4>
            <div className="flex flex-wrap gap-2">
              {patient.phenotype.map((factor: string, idx: number) => (
                <Badge
                  key={idx}
                  variant="default"
                  className={cn(
                    'border',
                    factor.includes('72') || factor.includes('DM') || factor.includes('CVC') || factor.includes('CHF')
                      ? 'border-rs-red text-rs-red bg-rs-red/10'
                      : 'border-renal-border text-renal-muted bg-renal-panel'
                  )}
                >
                  {factor}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium text-renal-muted uppercase tracking-wider mb-2">
              Current Alerts ({patient.alerts.length})
            </h4>
            <div className="space-y-2">
              {patient.alerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border',
                    getAlertBg(alert.severity)
                  )}
                >
                  {getAlertIcon(alert.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-renal-text">{alert.type}</span>
                      <span className="text-xs text-renal-muted">
                        {new Date(alert.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-renal-muted mt-1">{alert.description}</p>
                  </div>
                </div>
              ))}
              {patient.alerts.length === 0 && (
                <div className="flex items-center gap-2 text-rs-green">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">No active alerts</span>
                </div>
              )}
              {patient.alerts.length > 4 && (
                <div className="text-xs text-renal-muted text-center py-1">
                  +{patient.alerts.length - 4} more alerts
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Causal Pathway Visualization */}
        <div className="lg:col-span-3">
          <CausalPathwayVisualization patient={patient} />
        </div>
      </div>

      {/* Recommendations and Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recommendations */}
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-renal-text">Top 5 Recommendations</h3>
              <p className="text-xs text-renal-muted">Ranked by expected mortality reduction</p>
            </div>
          </div>

          <div className="space-y-3">
            {mockRecommendations.map((rec) => (
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
            ))}
          </div>
        </Card>

        {/* Intervention Simulator */}
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-renal-text mb-1">What-If Scenario Builder</h3>
          <p className="text-xs text-renal-muted mb-4">Adjust parameters to see real-time impact on mortality risk</p>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 accent-rs-blue"
                  checked={simulatorState.reduceWeight.enabled}
                  onChange={(e) => setSimulatorState(prev => ({
                    ...prev,
                    reduceWeight: { ...prev.reduceWeight, enabled: e.target.checked }
                  }))}
                />
                <span className="text-sm text-renal-text">Reduce dry weight</span>
              </label>
              <div className="px-2">
                <input
                  type="range"
                  min="-2"
                  max="1"
                  step="0.1"
                  value={simulatorState.reduceWeight.value}
                  onChange={(e) => setSimulatorState(prev => ({
                    ...prev,
                    reduceWeight: { ...prev.reduceWeight, value: parseFloat(e.target.value) }
                  }))}
                  className="w-full accent-rs-blue"
                  disabled={!simulatorState.reduceWeight.enabled}
                />
                <div className="flex justify-between text-xs text-renal-muted mt-1">
                  <span>-2kg</span>
                  <span className="text-renal-text font-medium">
                    {simulatorState.reduceWeight.enabled ? `Target: ${(65.0 + simulatorState.reduceWeight.value).toFixed(1)}kg` : 'Current: 65.0kg'}
                  </span>
                  <span>+1kg</span>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 accent-rs-blue"
                  checked={simulatorState.increaseTime.enabled}
                  onChange={(e) => setSimulatorState(prev => ({
                    ...prev,
                    increaseTime: { ...prev.increaseTime, enabled: e.target.checked }
                  }))}
                />
                <span className="text-sm text-renal-text">Increase session time</span>
              </label>
              <div className="px-2">
                <input
                  type="range"
                  min="180"
                  max="300"
                  step="15"
                  value={simulatorState.increaseTime.value}
                  onChange={(e) => setSimulatorState(prev => ({
                    ...prev,
                    increaseTime: { ...prev.increaseTime, value: parseInt(e.target.value) }
                  }))}
                  className="w-full accent-rs-blue"
                  disabled={!simulatorState.increaseTime.enabled}
                />
                <div className="flex justify-between text-xs text-renal-muted mt-1">
                  <span>180min</span>
                  <span className="text-renal-text font-medium">
                    {simulatorState.increaseTime.enabled ? `Target: ${simulatorState.increaseTime.value}min` : 'Current: 240min'}
                  </span>
                  <span>300min</span>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 accent-rs-blue"
                  checked={simulatorState.accessEval.enabled}
                  onChange={(e) => setSimulatorState(prev => ({
                    ...prev,
                    accessEval: { enabled: e.target.checked }
                  }))}
                />
                <span className="text-sm text-renal-text">Schedule access evaluation</span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-2 mb-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 accent-rs-blue"
                  checked={simulatorState.adjustBFR.enabled}
                  onChange={(e) => setSimulatorState(prev => ({
                    ...prev,
                    adjustBFR: { ...prev.adjustBFR, enabled: e.target.checked }
                  }))}
                />
                <span className="text-sm text-renal-text">Adjust blood flow rate</span>
              </label>
              <div className="px-2">
                <input
                  type="range"
                  min="250"
                  max="400"
                  step="25"
                  value={simulatorState.adjustBFR.value}
                  onChange={(e) => setSimulatorState(prev => ({
                    ...prev,
                    adjustBFR: { ...prev.adjustBFR, value: parseInt(e.target.value) }
                  }))}
                  className="w-full accent-rs-blue"
                  disabled={!simulatorState.adjustBFR.enabled}
                />
                <div className="flex justify-between text-xs text-renal-muted mt-1">
                  <span>250</span>
                  <span className="text-renal-text font-medium">
                    {simulatorState.adjustBFR.enabled ? `Target: ${simulatorState.adjustBFR.value} mL/min` : 'Current: 300 mL/min'}
                  </span>
                  <span>400</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-renal-border">
              <h4 className="text-xs font-medium text-renal-muted uppercase tracking-wider mb-3">Real-Time Simulation Results</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-renal-muted">90d Mortality</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-renal-text line-through">{patient.mortalityRisk['90d'].toFixed(1)}%</span>
                    <ArrowDown className="w-3 h-3 text-rs-green" />
                    <span className="text-sm font-bold text-rs-green">{simulationResults.mortality90d.toFixed(1)}%</span>
                    {simulationResults.mortality90d < patient.mortalityRisk['90d'] && (
                      <span className="text-xs text-rs-green">
                        ↓ {(patient.mortalityRisk['90d'] - simulationResults.mortality90d).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-renal-muted">Fluid Overload</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-renal-text line-through">78%</span>
                    <ArrowDown className="w-3 h-3 text-rs-green" />
                    <span className="text-sm font-bold text-rs-green">{simulationResults.fluidOverload.toFixed(0)}%</span>
                    {simulationResults.fluidOverload < 78 && (
                      <span className="text-xs text-rs-green">
                        ↓ {(78 - simulationResults.fluidOverload).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-renal-muted">Access Risk</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-renal-text line-through">72%</span>
                    <ArrowDown className="w-3 h-3 text-rs-green" />
                    <span className="text-sm font-bold text-rs-green">{simulationResults.accessRisk.toFixed(0)}%</span>
                    {simulationResults.accessRisk < 72 && (
                      <span className="text-xs text-rs-green">
                        ↓ {(72 - simulationResults.accessRisk).toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="ghost" size="sm" className="flex-1" onClick={handleReset}>Reset</Button>
                <Button variant="primary" size="sm" className="flex-1">Apply Changes</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};