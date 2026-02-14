import React, { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { TrendChart } from '../../components/charts/TrendChart';
import type { Patient, LabResult, Medication } from '../../types';
import { LabRangeBar } from '../../components/ui/LabRangeBar';

interface LabsMedsTabProps {
  patient: Patient;
}

export const LabsMedsTab: React.FC<LabsMedsTabProps> = ({ patient }) => {
  // Define scale ranges for markers
  const getScale = (name: string) => {
    switch (name) {
      case 'PSA': return { min: 0, max: 15 };
      case 'Vitamin D': return { min: 0, max: 150 };
      case 'Creatinine': return { min: 0.5, max: 10 };
      case 'Hemoglobin': return { min: 7, max: 15 };
      case 'Potassium': return { min: 2.5, max: 8 };
      case 'Albumin': return { min: 2, max: 6 };
      case 'Phosphorus': return { min: 1, max: 12 };
      case 'Calcium': return { min: 6, max: 12 };
      case 'Sodium': return { min: 120, max: 160 };
      case 'Bicarbonate': return { min: 10, max: 40 };
      case 'Ferritin': return { min: 0, max: 1500 };
      default: return { min: 0, max: 100 };
    }
  };

  // Lab trend data for charts
  // Map real lab history for trend charts
  const getTrendData = (name: string) => {
    return (patient.labs || [])
      .filter((l: LabResult) => l.name === name)
      .map((l: LabResult) => ({
        x: l.date.slice(5), // Show MM-DD
        y: l.value
      }))
      .reverse(); // Chronological order
  };

  const hemoglobinData = getTrendData('Hemoglobin');
  const albuminData = getTrendData('Albumin');
  const potassiumData = getTrendData('Potassium');
  const phosphorusData = getTrendData('Phosphorus');
  const calciumData = getTrendData('Calcium');
  const ferritinData = getTrendData('Ferritin');
  const creatinineData = getTrendData('Creatinine');
  const ureaData = getTrendData('Urea');


  const medicationCategories = [
    { name: 'Phosphate Binders', color: '#2f7df6' },
    { name: 'Vitamin D / MBD', color: '#06b6d4' },
    { name: 'ESA', color: '#8b5cf6' },
    { name: 'Iron Supplements', color: '#23d18b' },
    { name: 'BP Medications', color: '#ffb020' },
  ];

  // Filter for only the latest unique results for the category buckets
  const latestLabsOnly = useMemo(() => {
    const unique: LabResult[] = [];
    (patient.labs || []).forEach(lab => {
      if (!unique.find(u => u.name === lab.name)) {
        unique.push(lab);
      }
    });
    return unique;
  }, [patient.labs]);

  // Helper to render a lab item in the grid
  const renderLabItem = (lab: LabResult, statusColor: string) => (
    <div key={lab.name} className="flex flex-col p-6 hover:bg-white/5 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-renal-text text-base">{lab.name}</h4>
          <p className="text-xs text-renal-muted truncate">Normal range {lab.targetMin}-{lab.targetMax} {lab.unit}</p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${statusColor}`}>{lab.value}</div>
          <div className="text-[10px] text-renal-muted uppercase font-bold tracking-wider">{lab.unit}</div>
        </div>
      </div>

      <div className="flex-grow">
        <LabRangeBar
          currentValue={lab.value}
          previousValue={lab.previousValue}
          min={getScale(lab.name).min}
          max={getScale(lab.name).max}
          targetMin={lab.targetMin || 0}
          targetMax={lab.targetMax || 100}
          unit={lab.unit}
        />
      </div>

      <div className="mt-2 flex justify-end">
        <button className="text-[10px] text-renal-muted hover:text-renal-text flex items-center gap-1 uppercase tracking-widest font-bold">
          View History <span className="transform rotate-90">›</span>
        </button>
      </div>
    </div>
  );

  const renderLabSection = (title: string, subtitle: string, colorClass: string, status: string) => {
    const items = latestLabsOnly.filter(l => l.status === status);
    if (items.length === 0 && status !== 'critical') return null;

    return (
      <section>
        <h2 className={`text-lg font-bold ${colorClass.startsWith('text-') ? colorClass : `text-${colorClass}`} mb-4 flex items-center gap-2`}>
          {title}
          <span className="text-xs font-normal text-renal-muted uppercase tracking-wider ml-2">{subtitle}</span>
        </h2>
        <Card className="p-0 overflow-hidden">
          {items.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-renal-border/30">
              {items.map(lab => renderLabItem(lab, colorClass))}
              {/* Add an empty cell if there's only one item to maintain the 2-column vertical divider */}
              {items.length === 1 && <div className="hidden lg:block" />}
            </div>
          ) : (
            <div className="p-6 text-center text-renal-muted text-sm italic">No active {status} markers detected.</div>
          )}
        </Card>
      </section>
    );
  };

  return (
    <div className="space-y-6">
      {/* New Visual Lab Dashboard */}
      <div className="space-y-8">
        {renderLabSection('Latest Risks', 'High impact results', 'text-rs-red', 'critical')}
        {renderLabSection('Latest Borderline', 'Review required', 'text-rs-amber', 'warning')}
        {renderLabSection('Clinical Stability', 'Within target range', 'text-rs-green', 'normal')}
      </div>

      {/* Lab Trend Charts (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-renal-text mb-4">Hemoglobin Trend</h3>
          <div className="h-48">
            <TrendChart
              data={hemoglobinData}
              targetValue={10.75}
              warningValue={10}
              color="#8b5cf6"
            />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-rs-amber">
            <AlertTriangle className="w-4 h-4" />
            <span>Low Hb despite ESA therapy - consider investigating resistance</span>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-renal-text mb-4">Albumin Trend</h3>
          <div className="h-48">
            <TrendChart
              data={albuminData}
              warningValue={3.5}
              color="#2f7df6"
            />
          </div>
          <div className="mt-3 text-xs text-renal-muted">
            Declining trend over 6 months. Dietary intervention recommended.
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-renal-text mb-4">Potassium Trend</h3>
          <div className="h-48">
            <TrendChart
              data={potassiumData}
              targetValue={4.5}
              warningValue={5.0}
              criticalValue={5.5}
              color="#ff4d4f"
            />
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-rs-red">
            <AlertTriangle className="w-4 h-4" />
            <span>Hyperkalemia detected - review medications and diet</span>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-renal-text mb-4">Calcium Trend</h3>
          <div className="h-48">
            <TrendChart
              data={calciumData}
              targetValue={9.0}
              warningValue={8.5}
              color="#23d18b"
            />
          </div>
          <div className="mt-3 text-xs text-rs-green">
            Within target range
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-renal-text mb-4">Phosphorus Trend</h3>
          <div className="h-48">
            <TrendChart
              data={phosphorusData}
              targetValue={4.0}
              warningValue={4.5}
              color="#ffb020"
            />
          </div>
          <div className="mt-3 text-xs text-rs-amber">
            Elevated phosphorus - increase binder dose
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-renal-text mb-4">Ferritin Trend</h3>
          <div className="h-48">
            <TrendChart
              data={ferritinData}
              targetValue={350}
              warningValue={200}
              color="#2f7df6"
            />
          </div>
          <div className="mt-3 text-xs text-rs-green">
            Adequate iron stores
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-renal-text mb-4">Creatinine Trend</h3>
          <div className="h-48">
            <TrendChart
              data={creatinineData}
              targetValue={6.0}
              warningValue={8.0}
              color="#06b6d4"
            />
          </div>
          <div className="mt-3 text-xs text-renal-muted">
            Marker of renal clearance efficiency
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-renal-text mb-4">Urea Trend</h3>
          <div className="h-48">
            <TrendChart
              data={ureaData}
              targetValue={100}
              warningValue={130}
              color="#8b5cf6"
            />
          </div>
          <div className="mt-3 text-xs text-renal-muted">
            Dialysis adequacy indicator
          </div>
        </Card>
      </div>

      {/* Medications and Management Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-renal-text mb-4">Current Medications</h3>
          <div className="space-y-4">
            {medicationCategories.map((category) => {
              const meds = (patient.medications || []).filter((m: Medication) => m.category === category.name);
              if (meds.length === 0) return null;

              return (
                <div key={category.name}>
                  <h4 className="text-xs font-medium mb-2" style={{ color: category.color }}>
                    {category.name}
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {meds.map((med: Medication, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-renal-bg rounded-lg">
                        <div>
                          <div className="text-sm font-medium text-renal-text">{med.name}</div>
                          <div className="text-xs text-renal-muted">
                            {med.dose} {med.frequency} • {med.route}
                          </div>
                        </div>
                        <div className="text-xs text-renal-muted">
                          Started {med.startDate}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 bg-rs-red/10 border border-rs-red/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rs-red flex-shrink-0 mt-0.5" />
              <p className="text-xs text-rs-red">
                Alert: K+ 5.8 with ACEI/ARB prescribed - review medications
              </p>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-semibold text-renal-text mb-4">Anemia Management</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-renal-muted">Current Hb</span>
                <span className="text-lg font-bold text-rs-amber">9.8 g/dL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-renal-muted">Target</span>
                <span className="text-sm text-renal-text">10-11.5 g/dL</span>
              </div>
              <div className="h-px bg-renal-border" />
              <div>
                <div className="text-xs text-renal-muted mb-1">Current ESA</div>
                <div className="text-sm text-renal-text">Epoetin 4000 units x3/week</div>
              </div>
              <div>
                <div className="text-xs text-renal-muted mb-1">Iron Status</div>
                <div className="text-sm">
                  <span className="text-rs-green">Ferritin: 245 ng/mL ✓</span>
                </div>
                <div className="text-sm">
                  <span className="text-rs-green">TSAT: 28% ✓</span>
                </div>
              </div>
              <div className="p-2 bg-renal-bg rounded">
                <div className="text-xs text-renal-muted">ESA Responsiveness</div>
                <div className="text-sm font-bold text-rs-green">0.85 (Normal)</div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-renal-text mb-4">Mineral Bone Disease</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-renal-muted">Calcium</span>
                <span className="text-sm text-rs-green">8.9 mg/dL ✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-renal-muted">Phosphorus</span>
                <span className="text-sm text-rs-red">6.2 mg/dL ↑</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-renal-muted">PTH</span>
                <span className="text-sm text-rs-amber">485 pg/mL</span>
              </div>
              <div className="h-px bg-renal-border my-2" />
              <div className="flex justify-between">
                <span className="text-sm text-renal-muted">Ca×Phos</span>
                <span className="text-sm text-rs-amber">55.2</span>
              </div>
              <div className="mt-3 p-2 bg-rs-red/10 rounded">
                <div className="text-xs text-rs-red font-medium mb-1">Status: POORLY CONTROLLED</div>
                <div className="text-xs text-renal-muted">
                  • Increase phosphate binder dose<br />
                  • Consider vitamin D analog
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};