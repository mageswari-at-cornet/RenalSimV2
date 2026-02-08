export type RiskLevel = 'High' | 'Medium' | 'Low';
export type AlertSeverity = 'critical' | 'warning' | 'info';
export type Feasibility = 'Easy' | 'Moderate' | 'Complex';
export type Urgency = 'Urgent' | 'Routine';

export interface MortalityRisk {
  '30d': number;
  '90d': number;
  '1yr': number;
}

export interface Alert {
  id: string;
  type: string;
  severity: AlertSeverity;
  description: string;
  timestamp: string;
  relatedData?: Record<string, unknown>;
}

export interface Recommendation {
  id: string;
  rank: number;
  description: string;
  targetMediator: string;
  expectedMortalityReduction: number;
  feasibility: Feasibility;
  urgency: Urgency;
  category: string;
  rationale: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: 'Male' | 'Female';
  dialysisVintage: number;
  primaryDiagnosis: string;
  schedule: {
    daysPerWeek: number;
    durationPerSession: number;
  };
  riskLevel: RiskLevel;
  mortalityRisk: MortalityRisk;
  hospitalizationRisk: {
    '30d': number;
    '90d': number;
  };
  mortalityDelta: {
    '30d': number;
    '90d': number;
    '1yr': number;
  };
  alerts: Alert[];
  topRiskFactor: string;
  phenotype: string[];
  lastUpdated: string;
  facility: 'Center A' | 'Center B' | 'Center C';
  accessType: 'AVF' | 'AVG' | 'CVC';
  archetype: string;
}

export interface SessionData {
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  prescribedDuration: number;
  ufVolume: number;
  preWeight: number;
  postWeight: number;
  idwg: number;
  preSBP: number;
  preDBP: number;
  nadirSBP: number;
  postSBP: number;
  postDBP: number;
  vp: number;
  bfr: number;
  spktv: number;
  events: string[];
  terminatedEarly: boolean;
  terminationReason?: string;
}

export interface LabResult {
  name: string;
  value: number;
  unit: string;
  date: string;
  previousValue: number;
  targetMin?: number;
  targetMax?: number;
  status: 'normal' | 'warning' | 'critical';
}

export interface Medication {
  name: string;
  dose: string;
  frequency: string;
  route: string;
  category: string;
  startDate: string;
}

export interface AccessInfo {
  type: 'AVF' | 'AVG' | 'CVC';
  location: string;
  insertionDate: string;
  age: number;
  maturationStatus?: string;
  history: string[];
}

export interface AccessMetrics {
  vpSlope: number;
  meanVP: number;
  alarmsPerSession: number;
  bleedingEvents: number;
  cannulationDifficulty: number;
  recirculationRate?: number;
}

export interface ClinicalEvent {
  id: string;
  date: string;
  type: string;
  description: string;
  severity: 'High' | 'Moderate' | 'Low';
  outcome: string;
}

export interface Task {
  id: string;
  description: string;
  priority: 'Urgent' | 'High' | 'Medium' | 'Low';
  assignedTo: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Complete';
  createdDate: string;
}

export interface CarePlan {
  activeProblems: string[];
  goals: string[];
  upcomingProcedures: string[];
}

export interface MediatorActivation {
  name: string;
  activation: number;
  factors: string[];
}

export interface CausalPathway {
  phenotype: { label: string; value: string }[];
  mediators: MediatorActivation[];
  dominantPathway: string;
  narrative: string;
}

export type TabType = 'overview' | 'volume' | 'session' | 'adequacy' | 'access' | 'labs' | 'events' | 'quality';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SuggestedPrompt {
  id: string;
  text: string;
  category: string;
}