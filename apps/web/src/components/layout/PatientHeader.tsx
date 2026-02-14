import React from 'react';
import { ArrowLeft, Building2, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import type { Patient } from '../../types';

interface PatientHeaderProps {
  patient: Patient;
}

export const PatientHeader: React.FC<PatientHeaderProps> = ({ patient }) => {
  const navigate = useNavigate();

  const formatLastUpdated = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-gradient-to-br from-renal-panel to-renal-panel-secondary border-b border-renal-border p-6">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-renal-muted hover:text-renal-text transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to Cockpit</span>
      </button>

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-renal-text mb-2">{patient.name}</h1>
          <div className="flex items-center gap-4 text-sm text-renal-muted">
            <span className="font-mono text-renal-text">{patient.id}</span>
            <span className="w-px h-4 bg-renal-border" />
            <span>Age: {patient.age}</span>
            <span className="w-px h-4 bg-renal-border" />
            <span>{patient.sex}</span>
            <span className="w-px h-4 bg-renal-border" />
            <span>{patient.dialysisVintage} months on HD</span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="text-renal-muted">{patient.primaryDiagnosis}</span>
            <span className="w-px h-4 bg-renal-border" />
            <span className="text-renal-muted">
              Schedule: {patient.schedule.daysPerWeek}x/week, {patient.schedule.durationPerSession} min
            </span>
          </div>
          
          {/* Center and Access Type */}
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-renal-muted" />
              <span className="text-sm text-renal-muted">Center:</span>
              <span className="text-sm font-medium text-renal-text">{patient.facility}</span>
            </div>
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-renal-muted" />
              <span className="text-sm text-renal-muted">Access:</span>
              <span className={cn(
                'text-sm font-medium px-2 py-0.5 rounded-full',
                patient.accessType === 'AVF' ? 'bg-rs-green/20 text-rs-green' :
                patient.accessType === 'AVG' ? 'bg-rs-amber/20 text-rs-amber' :
                'bg-rs-red/20 text-rs-red'
              )}>
                {patient.accessType}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-renal-muted uppercase tracking-wider mb-1">Archetype</div>
          <div className="text-base font-semibold text-rs-amber mb-2">{patient.archetype}</div>
          <div className="text-xs text-renal-muted mb-1">Last updated</div>
          <div className="text-sm text-renal-text">{formatLastUpdated(patient.lastUpdated)}</div>
        </div>
      </div>
    </div>
  );
};