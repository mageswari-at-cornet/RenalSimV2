import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface FilterState {
  facilities: string[];
  accessTypes: string[];
  minMortality: number;
  topN: number;
}

interface FacilityFilterSectionProps {
  onFilterChange: (filters: FilterState) => void;
}

const FACILITIES = ['Center A', 'Center B', 'Center C', 'Center D', 'Center E'];
const ACCESS_TYPES = ['AVF', 'AVG', 'CVC'];

export const FacilityFilterSection: React.FC<FacilityFilterSectionProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<FilterState>({
    facilities: [],
    accessTypes: [],
    minMortality: 0,
    topN: 50,
  });

  const toggleFacility = (facility: string) => {
    setFilters(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  const toggleAccessType = (type: string) => {
    setFilters(prev => ({
      ...prev,
      accessTypes: prev.accessTypes.includes(type)
        ? prev.accessTypes.filter(t => t !== type)
        : [...prev.accessTypes, type],
    }));
  };

  const handleReset = () => {
    setFilters({
      facilities: [],
      accessTypes: [],
      minMortality: 0,
      topN: 50,
    });
    onFilterChange({
      facilities: [],
      accessTypes: [],
      minMortality: 0,
      topN: 50,
    });
  };

  return (
    <Card className="h-full">
      <h3 className="text-sm font-semibold text-renal-text mb-4">Facility Filters</h3>
      
      {/* Facility Multiselect */}
      <div className="mb-4">
        <label className="text-xs text-renal-muted uppercase tracking-wider mb-2 block">
          Facilities
        </label>
        <div className="flex flex-wrap gap-2">
          {FACILITIES.map(facility => (
            <button
              key={facility}
              onClick={() => toggleFacility(facility)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filters.facilities.includes(facility)
                  ? 'bg-rs-blue text-white'
                  : 'bg-renal-bg text-renal-muted hover:text-renal-text'
              }`}
            >
              {facility}
            </button>
          ))}
        </div>
      </div>

      {/* Access Type Multiselect */}
      <div className="mb-4">
        <label className="text-xs text-renal-muted uppercase tracking-wider mb-2 block">
          Access Types
        </label>
        <div className="flex flex-wrap gap-2">
          {ACCESS_TYPES.map(type => (
            <button
              key={type}
              onClick={() => toggleAccessType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filters.accessTypes.includes(type)
                  ? 'bg-rs-blue text-white'
                  : 'bg-renal-bg text-renal-muted hover:text-renal-text'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Minimum Mortality Threshold */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-renal-muted uppercase tracking-wider">
            Min Mortality Threshold
          </label>
          <span className="text-sm font-bold text-renal-text">{filters.minMortality}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={filters.minMortality}
          onChange={(e) => setFilters(prev => ({ ...prev, minMortality: parseInt(e.target.value) }))}
          className="w-full accent-rs-blue"
        />
      </div>

      {/* Top N Patients */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-renal-muted uppercase tracking-wider">
            Top N Patients
          </label>
          <span className="text-sm font-bold text-renal-text">{filters.topN}</span>
        </div>
        <input
          type="range"
          min="10"
          max="100"
          step="10"
          value={filters.topN}
          onChange={(e) => setFilters(prev => ({ ...prev, topN: parseInt(e.target.value) }))}
          className="w-full accent-rs-blue"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-4">
        <Button variant="ghost" size="sm" onClick={handleReset} className="flex-1">
          Reset
        </Button>
      </div>

      {/* Active Filters Display */}
      {(filters.facilities.length > 0 || filters.accessTypes.length > 0) && (
        <div className="mt-4 pt-4 border-t border-renal-border">
          <p className="text-xs text-renal-muted mb-2">Active Filters:</p>
          <div className="flex flex-wrap gap-1">
            {filters.facilities.map(f => (
              <Badge key={f} variant="default" className="text-xs bg-rs-blue/20 text-rs-blue">
                {f}
              </Badge>
            ))}
            {filters.accessTypes.map(t => (
              <Badge key={t} variant="default" className="text-xs bg-rs-green/20 text-rs-green">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};