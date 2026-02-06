import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { TrendChart } from '../../components/charts/TrendChart';
import { mockLabResults, mockMedications } from '../../data/mockData';
import { cn } from '../../utils/cn';
import type { Patient } from '../../types';

interface LabsMedsTabProps {
  patient: Patient;
}

export const LabsMedsTab: React.FC<LabsMedsTabProps> = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-rs-green';
      case 'warning':
        return 'text-rs-amber';
      case 'critical':
        return 'text-rs-red';
      default:
        return 'text-renal-text';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-rs-green/10';
      case 'warning':
        return 'bg-rs-amber/10';
      case 'critical':
        return 'bg-rs-red/10';
      default:
        return 'bg-renal-bg';
    }
  };

  // Lab trend data for charts
  const hemoglobinData = [
    { x: 'Jul', y: 10.5 },
    { x: 'Aug', y: 10.8 },
    { x: 'Sep', y: 10.6 },
    { x: 'Oct', y: 10.9 },
    { x: 'Nov', y: 10.4 },
    { x: 'Dec', y: 10.2 },
    { x: 'Jan', y: 9.8 },
  ];

  const albuminData = [
    { x: 'Jul', y: 3.6 },
    { x: 'Aug', y: 3.7 },
    { x: 'Sep', y: 3.5 },
    { x: 'Oct', y: 3.5 },
    { x: 'Nov', y: 3.4 },
    { x: 'Dec', y: 3.4 },
    { x: 'Jan', y: 3.2 },
  ];

  const potassiumData = [
    { x: 'Jul', y: 4.8 },
    { x: 'Aug', y: 5.0 },
    { x: 'Sep', y: 5.2 },
    { x: 'Oct', y: 5.4 },
    { x: 'Nov', y: 5.6 },
    { x: 'Dec', y: 5.4 },
    { x: 'Jan', y: 5.8 },
  ];

  const phosphorusData = [
    { x: 'Jul', y: 4.8 },
    { x: 'Aug', y: 5.2 },
    { x: 'Sep', y: 5.4 },
    { x: 'Oct', y: 5.6 },
    { x: 'Nov', y: 5.8 },
    { x: 'Dec', y: 5.8 },
    { x: 'Jan', y: 6.2 },
  ];

  const calciumData = [
    { x: 'Jul', y: 9.2 },
    { x: 'Aug', y: 9.1 },
    { x: 'Sep', y: 9.0 },
    { x: 'Oct', y: 8.9 },
    { x: 'Nov', y: 9.0 },
    { x: 'Dec', y: 9.1 },
    { x: 'Jan', y: 8.9 },
  ];

  const pthData = [
    { x: 'Jul', y: 420 },
    { x: 'Aug', y: 450 },
    { x: 'Sep', y: 480 },
    { x: 'Oct', y: 520 },
    { x: 'Nov', y: 520 },
    { x: 'Dec', y: 520 },
    { x: 'Jan', y: 485 },
  ];

  const ferritinData = [
    { x: 'Jul', y: 180 },
    { x: 'Aug', y: 195 },
    { x: 'Sep', y: 210 },
    { x: 'Oct', y: 225 },
    { x: 'Nov', y: 210 },
    { x: 'Dec', y: 198 },
    { x: 'Jan', y: 245 },
  ];

  const medicationCategories = [
    { name: 'Phosphate Binders', color: '#2f7df6' },
    { name: 'ESA', color: '#8b5cf6' },
    { name: 'Iron Supplements', color: '#23d18b' },
    { name: 'BP Medications', color: '#ffb020' },
  ];

  return (
    <div className="space-y-6">
      {/* Lab Summary Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-renal-text">Laboratory Results</h3>
          <span className="text-xs text-renal-muted">Last updated: 5 days ago</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-renal-border">
                <th className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase">Marker</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase">Latest</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase">Previous</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase">Target Range</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockLabResults.map((lab) => (
                <tr key={lab.name} className="border-b border-renal-border/50 hover:bg-white/5">
                  <td className="px-4 py-3 text-sm font-medium text-renal-text">{lab.name}</td>
                  <td className={cn('px-4 py-3 text-sm font-bold font-mono', getStatusColor(lab.status))}>
                    {lab.value} {lab.unit}
                  </td>
                  <td className="px-4 py-3 text-sm text-renal-muted">{lab.date}</td>
                  <td className="px-4 py-3 text-sm text-renal-muted">
                    {lab.previousValue} {lab.unit}
                  </td>
                  <td className="px-4 py-3 text-sm text-renal-muted">
                    {lab.targetMin}-{lab.targetMax} {lab.unit}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      getStatusBg(lab.status),
                      getStatusColor(lab.status)
                    )}>
                      {lab.status === 'normal' ? 'Normal' : lab.status === 'warning' ? 'Abnormal' : 'Critical'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Lab Trend Charts - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </div>

      {/* Lab Trend Charts - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </div>

      {/* Lab Trend Charts - Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          <h3 className="text-sm font-semibold text-renal-text mb-4">PTH Trend</h3>
          <div className="h-48">
            <TrendChart
              data={pthData}
              targetValue={225}
              warningValue={300}
              color="#8b5cf6"
            />
          </div>
          <div className="mt-3 text-xs text-rs-amber">
            Elevated PTH - consider vitamin D analog
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
      </div>

      {/* Medications and Management Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-renal-text mb-4">Current Medications</h3>
          <div className="space-y-4">
            {medicationCategories.map((category) => {
              const meds = mockMedications.filter(m => m.category === category.name);
              if (meds.length === 0) return null;
              
              return (
                <div key={category.name}>
                  <h4 className="text-xs font-medium mb-2" style={{ color: category.color }}>
                    {category.name}
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {meds.map((med, idx) => (
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