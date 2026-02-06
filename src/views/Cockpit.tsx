import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, AlertCircle, Info, ChevronUp, ChevronDown } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card } from '../components/ui/Card';
import { KPICard } from '../components/ui/KPICard';
import { RiskMixGraph } from '../components/charts/RiskMixGraph';
import { FacilityFilterSection } from '../components/layout/FacilityFilterSection';
import { mockPatients } from '../data/mockData';
import { cn } from '../utils/cn';
import type { AlertSeverity } from '../types';

type SortField = 'id' | 'name' | 'mortality30d' | 'mortality90d' | 'mortality1yr' | 'alerts' | 'topRiskFactor';
type SortDirection = 'asc' | 'desc';
type FilterType = 'all' | 'high-risk' | 'alerts' | 'labs-due' | 'access-issues';

interface FilterState {
  facilities: string[];
  accessTypes: string[];
  minMortality: number;
  topN: number;
}

const getRiskColor = (risk: number) => {
  if (risk > 20) return 'text-rs-red';
  if (risk > 10) return 'text-rs-amber';
  return 'text-rs-green';
};

const getAlertIcon = (severity: AlertSeverity) => {
  switch (severity) {
    case 'critical':
      return <AlertTriangle className="w-4 h-4 text-rs-red" />;
    case 'warning':
      return <AlertCircle className="w-4 h-4 text-rs-amber" />;
    case 'info':
      return <Info className="w-4 h-4 text-rs-blue" />;
  }
};

export const Cockpit: React.FC = () => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('mortality90d');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [facilityFilters, setFacilityFilters] = useState<FilterState>({
    facilities: [],
    accessTypes: [],
    minMortality: 0,
    topN: 50,
  });

  const filteredPatients = useMemo(() => {
    let filtered = [...mockPatients];
    
    // Apply facility filters
    if (facilityFilters.facilities.length > 0) {
      filtered = filtered.filter(() => true); // Mock filter - would filter by actual facility
    }
    
    if (facilityFilters.accessTypes.length > 0) {
      filtered = filtered.filter(() => true); // Mock filter - would filter by access type
    }
    
    if (facilityFilters.minMortality > 0) {
      filtered = filtered.filter(p => p.mortalityRisk['90d'] >= facilityFilters.minMortality);
    }
    
    // Apply quick filters
    switch (activeFilter) {
      case 'high-risk':
        filtered = filtered.filter(p => p.riskLevel === 'High');
        break;
      case 'alerts':
        filtered = filtered.filter(p => p.alerts.length > 0);
        break;
      case 'labs-due':
        filtered = filtered.filter(p => p.alerts.some(a => a.type.includes('Labs')));
        break;
      case 'access-issues':
        filtered = filtered.filter(p => p.topRiskFactor.includes('Access'));
        break;
    }

    // Sort
    filtered = filtered.sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (sortField) {
        case 'id':
          aVal = a.id;
          bVal = b.id;
          break;
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'mortality30d':
          aVal = a.mortalityRisk['30d'];
          bVal = b.mortalityRisk['30d'];
          break;
        case 'mortality90d':
          aVal = a.mortalityRisk['90d'];
          bVal = b.mortalityRisk['90d'];
          break;
        case 'mortality1yr':
          aVal = a.mortalityRisk['1yr'];
          bVal = b.mortalityRisk['1yr'];
          break;
        case 'alerts':
          aVal = a.alerts.length;
          bVal = b.alerts.length;
          break;
        case 'topRiskFactor':
          aVal = a.topRiskFactor;
          bVal = b.topRiskFactor;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    // Apply top N limit
    return filtered.slice(0, facilityFilters.topN);
  }, [sortField, sortDirection, activeFilter, facilityFilters]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const highRiskCount = mockPatients.filter(p => p.riskLevel === 'High').length;
  const avgMortality = mockPatients.reduce((acc, p) => acc + p.mortalityRisk['90d'], 0) / mockPatients.length;
  const urgentCount = mockPatients.filter(p => p.alerts.some(a => a.severity === 'critical')).length;

  const filterCounts = {
    all: mockPatients.length,
    'high-risk': mockPatients.filter(p => p.riskLevel === 'High').length,
    'alerts': mockPatients.filter(p => p.alerts.length > 0).length,
    'labs-due': mockPatients.filter(p => p.alerts.some(a => a.type.includes('Labs'))).length,
    'access-issues': mockPatients.filter(p => p.topRiskFactor.includes('Access')).length,
  };

  return (
    <div className="min-h-screen bg-renal-bg">
      <Header facilityName="RenalSim Dashboard" lastUpdated="2 minutes ago" />
      
      <main className="p-6">
        {/* Summary KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <KPICard
            label="Total Active Patients"
            value={mockPatients.length}
            subtitle="Currently on HD"
          />
          <KPICard
            label="High-Risk Patients"
            value={highRiskCount}
            subtitle={`${((highRiskCount / mockPatients.length) * 100).toFixed(1)}% of cohort`}
            status="critical"
          />
          <KPICard
            label="Avg 90-Day Mortality"
            value={`${avgMortality.toFixed(1)}%`}
            status={avgMortality > 20 ? 'critical' : avgMortality > 10 ? 'warning' : 'good'}
          />
          <KPICard
            label="Urgent Review Needed"
            value={urgentCount}
            subtitle="Critical alerts"
            status={urgentCount > 0 ? 'critical' : 'good'}
          />
        </div>

        {/* Facility Filter and Risk Mix Graph - 50/50 Split */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Facility Filters - Left 50% */}
          <div className="min-w-0">
            <FacilityFilterSection onFilterChange={setFacilityFilters} />
          </div>
          
          {/* Risk Mix Graph - Right 50% */}
          <div className="min-w-0">
            <RiskMixGraph patients={mockPatients} />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Quick Filter Panel */}
          <div className="w-72 flex-shrink-0">
            <Card>
              <h3 className="text-sm font-semibold text-renal-text mb-4">Quick Filters</h3>
              
              <div className="space-y-2">
                {[
                  { id: 'all', label: 'All Patients' },
                  { id: 'high-risk', label: 'High-risk only' },
                  { id: 'alerts', label: 'With alerts' },
                  { id: 'labs-due', label: 'Due for labs' },
                  { id: 'access-issues', label: 'Access issues' },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id as FilterType)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                      activeFilter === filter.id
                        ? 'bg-rs-blue/20 text-rs-blue'
                        : 'text-renal-muted hover:bg-white/5'
                    )}
                  >
                    <span>{filter.label}</span>
                    <span className="text-xs bg-renal-bg px-2 py-0.5 rounded-full">
                      {filterCounts[filter.id as FilterType]}
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Patient Table */}
          <Card className="flex-1 p-0 overflow-hidden">
            <div className="p-4 border-b border-renal-border">
              <h2 className="text-lg font-semibold text-renal-text">Patient Cohort</h2>
              <p className="text-sm text-renal-muted mt-1">
                Showing {filteredPatients.length} of {mockPatients.length} patients
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-renal-border">
                    {[
                      { field: 'id' as SortField, label: 'Patient ID', width: '100px' },
                      { field: 'name' as SortField, label: 'Name', width: '180px' },
                      { field: 'mortality30d' as SortField, label: '30d Mortality', width: '110px' },
                      { field: 'mortality90d' as SortField, label: '90d Mortality', width: '110px' },
                      { field: 'mortality1yr' as SortField, label: '1yr Mortality', width: '110px' },
                      { field: 'alerts' as SortField, label: 'Alerts', width: '80px' },
                      { field: 'topRiskFactor' as SortField, label: 'Top Risk Factor', width: '180px' },
                    ].map((col) => (
                      <th
                        key={col.field + col.label}
                        className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-colors"
                        style={{ width: col.width }}
                        onClick={() => handleSort(col.field)}
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          <SortIcon field={col.field} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="border-b border-renal-border/50 hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => navigate(`/patient/${patient.id}`)}
                    >
                      <td className="px-4 py-3 font-mono text-sm text-renal-text">{patient.id}</td>
                      <td className="px-4 py-3 text-sm text-renal-text font-medium">{patient.name}</td>
                      <td className={cn('px-4 py-3 font-mono text-sm', getRiskColor(patient.mortalityRisk['30d']))}>
                        {patient.mortalityRisk['30d'].toFixed(1)}%
                      </td>
                      <td className={cn('px-4 py-3 font-mono text-sm', getRiskColor(patient.mortalityRisk['90d']))}>
                        {patient.mortalityRisk['90d'].toFixed(1)}%
                      </td>
                      <td className={cn('px-4 py-3 font-mono text-sm', getRiskColor(patient.mortalityRisk['1yr']))}>
                        {patient.mortalityRisk['1yr'].toFixed(1)}%
                      </td>
                      <td className="px-4 py-3">
                        {patient.alerts.length > 0 && (
                          <div className="flex items-center gap-1">
                            {getAlertIcon(patient.alerts[0].severity)}
                            <span className="text-sm font-bold text-renal-text">
                              {patient.alerts.length}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-renal-muted">{patient.topRiskFactor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredPatients.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-renal-muted">No patients match the selected filters</p>
                <button
                  onClick={() => setActiveFilter('all')}
                  className="mt-2 text-rs-blue hover:underline text-sm"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};