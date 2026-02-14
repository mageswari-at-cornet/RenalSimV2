import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, AlertCircle, Info, ChevronUp, ChevronDown } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { KPICard } from '../components/ui/KPICard';
import { RiskMixGraph } from '../components/charts/RiskMixGraph';
import { FacilityFilterSection } from '../components/layout/FacilityFilterSection';
import { cn } from '../utils/cn';
import { api } from '../services/api';
import type { AlertSeverity, Patient } from '../types';

type SortField = 'id' | 'name' | 'mortality30d' | 'hospitalization30d' | 'mortality90d' | 'alerts' | 'topRiskFactor' | 'facility' | 'accessType';
type SortDirection = 'asc' | 'desc';
type FilterType = 'all' | 'high-risk' | 'alerts' | 'access-issues';

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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch patients on mount
  React.useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await api.getPatients();
        setPatients(data);
      } catch (error) {
        console.error('Failed to fetch patients', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const [sortField, setSortField] = useState<SortField>('mortality30d');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [facilityFilters, setFacilityFilters] = useState<FilterState>({
    facilities: [],
    accessTypes: [],
    minMortality: 0,
    topN: 6,
  });

  // Filter for patient table (only facility, access type, and quick filters)
  const tablePatients = useMemo(() => {
    let filtered = [...patients];

    // Apply facility filters
    if (facilityFilters.facilities.length > 0) {
      filtered = filtered.filter(p => facilityFilters.facilities.includes(p.facility));
    }

    // Apply access type filters
    if (facilityFilters.accessTypes.length > 0) {
      filtered = filtered.filter(p => facilityFilters.accessTypes.includes(p.accessType));
    }

    // Apply quick filters
    switch (activeFilter) {
      case 'high-risk':
        filtered = filtered.filter(p => p.riskLevel === 'High');
        break;
      case 'alerts':
        filtered = filtered.filter(p => p.alerts.length > 0);
        break;
      case 'access-issues':
        filtered = filtered.filter(p => p.topRiskFactor.includes('Access') || p.accessType === 'CVC');
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
        case 'hospitalization30d':
          aVal = a.hospitalizationRisk['30d'];
          bVal = b.hospitalizationRisk['30d'];
          break;
        case 'mortality90d':
          aVal = a.mortalityRisk['90d'];
          bVal = b.mortalityRisk['90d'];
          break;
        case 'alerts':
          aVal = a.alerts.length;
          bVal = b.alerts.length;
          break;
        case 'topRiskFactor':
          aVal = a.topRiskFactor;
          bVal = b.topRiskFactor;
          break;
        case 'facility':
          aVal = a.facility;
          bVal = b.facility;
          break;
        case 'accessType':
          aVal = a.accessType;
          bVal = b.accessType;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [sortField, sortDirection, activeFilter, facilityFilters.facilities, facilityFilters.accessTypes]);

  // Filter for graph (table filters + Top N + Mortality threshold)
  const graphPatients = useMemo(() => {
    let filtered = [...tablePatients];

    // Apply mortality threshold (graph only)
    if (facilityFilters.minMortality > 0) {
      filtered = filtered.filter(p => p.mortalityRisk['90d'] >= facilityFilters.minMortality);
    }

    // Apply top N limit (graph only)
    return filtered.slice(0, facilityFilters.topN);
  }, [tablePatients, facilityFilters.minMortality, facilityFilters.topN]);

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

  const highRiskCount = patients.filter(p => p.riskLevel === 'High').length;
  const avgMortality = patients.length > 0
    ? patients.reduce((acc, p) => acc + p.mortalityRisk['30d'], 0) / patients.length
    : 0;
  const urgentCount = patients.filter(p => p.alerts.some(a => a.severity === 'critical')).length;

  const filterCounts = {
    all: patients.length,
    'high-risk': patients.filter(p => p.riskLevel === 'High').length,
    'alerts': patients.filter(p => p.alerts.length > 0).length,
    'access-issues': patients.filter(p => p.topRiskFactor.includes('Access') || p.accessType === 'CVC').length,
  };

  return (
    <div className="min-h-screen bg-renal-bg">
      {/* Dialysis CoPilot Header */}
      <div className="bg-gradient-to-r from-renal-panel to-renal-panel-secondary border-b border-renal-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-renal-text">Dialysis CoPilot</h1>
            <p className="text-sm text-renal-muted mt-1">HD Command Center | In-Center Hemodialysis</p>
          </div>
        </div>
      </div>

      <main className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-renal-muted">Loading patient cohort...</div>
          </div>
        ) : (
          <>
            {/* Summary KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <KPICard
                label="Total Active Patients"
                value={patients.length}
                subtitle="Currently on HD"
              />
              <KPICard
                label="High-Risk Patients"
                value={highRiskCount}
                subtitle={`${patients.length > 0 ? ((highRiskCount / patients.length) * 100).toFixed(1) : 0}% of cohort`}
                status="critical"
              />
              <KPICard
                label="Avg 30-Day Mortality"
                value={`${avgMortality.toFixed(1)}%`}
                status={avgMortality > 10 ? 'critical' : avgMortality > 5 ? 'warning' : 'good'}
              />
              <KPICard
                label="Urgent Review Needed"
                value={urgentCount}
                subtitle="Critical alerts"
                status={urgentCount > 0 ? 'critical' : 'good'}
              />
            </div>

            {/* Facility Filters and Risk Mix Graph - Side by Side (Swapped) */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Facility Filters - Left */}
              <div className="min-w-0">
                <FacilityFilterSection onFilterChange={setFacilityFilters} />
              </div>

              {/* Risk Mix Graph - Right */}
              <div className="min-w-0">
                <RiskMixGraph patients={graphPatients} />
              </div>
            </div>

            {/* Quick Filter Buttons - Above Patient List */}
            <Card className="mb-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-renal-text whitespace-nowrap">Quick Filters:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'all', label: 'All Patients' },
                    { id: 'high-risk', label: 'High-risk only' },
                    { id: 'alerts', label: 'With alerts' },
                    { id: 'access-issues', label: 'Access issues' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id as FilterType)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                        activeFilter === filter.id
                          ? 'bg-rs-blue/20 text-rs-blue border border-rs-blue/30'
                          : 'bg-renal-bg text-renal-muted border border-renal-border hover:text-renal-text'
                      )}
                    >
                      <span>{filter.label}</span>
                      <span className="text-xs bg-renal-panel px-1.5 py-0.5 rounded-full">
                        {filterCounts[filter.id as FilterType]}
                      </span>
                    </button>
                  ))}

                  {/* Active Facility/Access Filters - Inline */}
                  {facilityFilters.facilities.map(f => (
                    <span key={f} className="text-xs px-2 py-1.5 bg-rs-blue/20 text-rs-blue rounded-lg border border-rs-blue/30 flex items-center">
                      {f}
                    </span>
                  ))}
                  {facilityFilters.accessTypes.map(t => (
                    <span key={t} className="text-xs px-2 py-1.5 bg-rs-green/20 text-rs-green rounded-lg border border-rs-green/30 flex items-center">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Card>

            {/* Patient Table - Below Filters */}
            <Card className="p-0 overflow-hidden">
              <div className="p-4 border-b border-renal-border">
                <h2 className="text-lg font-semibold text-renal-text">Patient Cohort</h2>
                <p className="text-sm text-renal-muted mt-1">
                  Showing {tablePatients.length} of {patients.length} patients
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-renal-border">
                      {[
                        { field: 'id' as SortField, label: 'Patient ID', width: '110px' },
                        { field: 'name' as SortField, label: 'Name', width: '150px' },
                        { field: 'facility' as SortField, label: 'Center', width: '90px' },
                        { field: 'accessType' as SortField, label: 'Access', width: '70px' },
                        { field: 'mortality30d' as SortField, label: '30d Mort', width: '85px' },
                        { field: 'hospitalization30d' as SortField, label: '30d Hosp', width: '85px' },
                        { field: 'mortality90d' as SortField, label: '90d Mort', width: '85px' },
                        { field: 'alerts' as SortField, label: 'Alerts', width: '70px' },
                        { field: 'topRiskFactor' as SortField, label: 'Archetype / Risk', width: '200px' },
                      ].map((col) => (
                        <th
                          key={col.field}
                          className="text-left px-3 py-3 text-xs font-bold text-renal-muted uppercase tracking-wider cursor-pointer hover:bg-white/5 transition-colors"
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
                    {tablePatients.map((patient) => (
                      <tr
                        key={patient.id}
                        className="border-b border-renal-border/50 hover:bg-white/5 cursor-pointer transition-colors"
                        onClick={() => navigate(`/patient/${patient.id}`)}
                      >
                        <td className="px-3 py-3 font-mono text-sm text-renal-text">{patient.id}</td>
                        <td className="px-3 py-3 text-sm text-renal-text font-medium">{patient.name}</td>
                        <td className="px-3 py-3 text-xs text-renal-muted">{patient.facility}</td>
                        <td className="px-3 py-3">
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded-full font-medium',
                            patient.accessType === 'AVF' ? 'bg-rs-green/20 text-rs-green' :
                              patient.accessType === 'AVG' ? 'bg-rs-amber/20 text-rs-amber' :
                                'bg-rs-red/20 text-rs-red'
                          )}>
                            {patient.accessType}
                          </span>
                        </td>
                        <td className={cn('px-3 py-3 font-mono text-sm font-bold', getRiskColor(patient.mortalityRisk['30d']))}>
                          {patient.mortalityRisk['30d'].toFixed(1)}%
                        </td>
                        <td className={cn('px-3 py-3 font-mono text-sm', getRiskColor(patient.hospitalizationRisk['30d']))}>
                          {patient.hospitalizationRisk['30d'].toFixed(1)}%
                        </td>
                        <td className={cn('px-3 py-3 font-mono text-sm text-renal-muted')}>
                          {patient.mortalityRisk['90d'].toFixed(1)}%
                        </td>
                        <td className="px-3 py-3">
                          {patient.alerts.length > 0 ? (
                            <div className="flex items-center gap-1">
                              {getAlertIcon(patient.alerts[0].severity)}
                              <span className="text-sm font-bold text-renal-text">
                                {patient.alerts.length}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-renal-muted">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-sm text-renal-text">
                          {patient.archetype}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {tablePatients.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-renal-muted">No patients match the selected filters</p>
                  <button
                    onClick={() => {
                      setActiveFilter('all');
                      setFacilityFilters({
                        facilities: [],
                        accessTypes: [],
                        minMortality: 0,
                        topN: 6,
                      });
                    }}
                    className="mt-2 text-rs-blue hover:underline text-sm"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </Card>
          </>
        )}
      </main>
    </div>
  );
};
