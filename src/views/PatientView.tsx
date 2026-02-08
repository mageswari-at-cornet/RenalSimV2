import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { PatientHeader } from '../components/layout/PatientHeader';
import { CopilotLevers, type LeverState, type MediatorScores } from '../components/layout/CopilotLevers';
import { PatientChat } from '../components/chat/PatientChat';
import { cn } from '../utils/cn';

import { TabNavigation } from '../components/layout/TabNavigation';
import { OverviewTab } from './tabs/OverviewTab';
import { VolumeBPTab } from './tabs/VolumeBPTab';
import { SessionDataTab } from './tabs/SessionDataTab';
import { AdequacyTab } from './tabs/AdequacyTab';
import { AccessTab } from './tabs/AccessTab';
import { LabsMedsTab } from './tabs/LabsMedsTab';
import { EventsTasksTab } from './tabs/EventsTasksTab';
import { DataQualityTab } from './tabs/DataQualityTab';
import { mockPatients } from '../data/mockData';
import type { TabType } from '../types';

export const PatientView: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [mediators, setMediators] = useState<MediatorScores | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const patient = mockPatients.find(p => p.id === patientId);

  const handleLeversChange = (_levers: LeverState, newMediators: MediatorScores) => {
    setMediators(newMediators);
  };

  if (!patient) {
    return (
      <div className="min-h-screen bg-renal-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-renal-text mb-2">Patient Not Found</h1>
          <p className="text-renal-muted">The patient you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab patient={patient} mediators={mediators} isChatOpen={isChatOpen} />;
      case 'volume':
        return <VolumeBPTab patient={patient} />;
      case 'session':
        return <SessionDataTab patient={patient} />;
      case 'adequacy':
        return <AdequacyTab patient={patient} />;
      case 'access':
        return <AccessTab patient={patient} />;
      case 'labs':
        return <LabsMedsTab patient={patient} />;
      case 'events':
        return <EventsTasksTab patient={patient} />;
      case 'quality':
        return <DataQualityTab patient={patient} />;
      default:
        return <OverviewTab patient={patient} isChatOpen={isChatOpen} />;
    }
  };

  return (
    <div className="min-h-screen bg-renal-bg">
      <Header onAskAI={() => setIsChatOpen(true)} />
      
      <div className="flex">
        {/* Main content - shrinks when chat is open */}
        <div className={cn(
          'flex-1 min-w-0 transition-all duration-300',
          isChatOpen ? 'mr-[400px]' : 'mr-0'
        )}>
          <PatientHeader patient={patient} />

          {/* Copilot Levers - positioned below patient details */}
          <CopilotLevers patient={patient} onLeversChange={handleLeversChange} />

          <div className="bg-renal-panel border-b border-renal-border">
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          <main className="p-6">
            {renderTab()}
          </main>
        </div>

        {/* AI Chat Sidebar - Fixed */}
        <PatientChat patient={patient} isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
      </div>
    </div>
  );
};
