import type { Patient, SessionData, LabResult, Medication, AccessInfo, AccessMetrics, ClinicalEvent, Task, CarePlan, Recommendation, CausalPathway } from '../types';

// 6 Patients matching d3.py archetypes with 2025-2026 dates
export const mockPatients: Patient[] = [
  {
    id: 'HD-1074',
    name: 'James Thompson',
    age: 68,
    sex: 'Male',
    dialysisVintage: 52,
    primaryDiagnosis: 'Diabetic Nephropathy',
    schedule: { daysPerWeek: 3, durationPerSession: 240 },
    riskLevel: 'High',
    mortalityRisk: { '30d': 12.5, '90d': 32.8, '1yr': 68.5 },
    hospitalizationRisk: { '30d': 18.5, '90d': 42.3 },
    mortalityDelta: { '30d': 3.2, '90d': 6.5, '1yr': 12.8 },
    alerts: [
      { id: 'A1', type: 'IDH Burden', severity: 'critical', description: 'IDH in 55% of sessions', timestamp: '2026-02-05T10:30:00Z' },
      { id: 'A2', type: 'Volume Overload', severity: 'critical', description: 'IDWG >5% body weight', timestamp: '2026-02-04T08:00:00Z' },
      { id: 'A3', type: 'CHF Exacerbation', severity: 'warning', description: 'Crackles present', timestamp: '2026-02-03T09:00:00Z' },
    ],
    topRiskFactor: 'The Crasher (IDH/HF)',
    phenotype: ['Age 68', 'Male', 'DM+', 'HTN+', 'CHF+', '52mo vintage', 'High UF demand'],
    lastUpdated: '2026-02-06T14:30:00Z',
    facility: 'Center A',
    accessType: 'AVG',
    archetype: 'The Crasher (IDH/HF)',
  },
  {
    id: 'HD-1077',
    name: 'Mary Johnson',
    age: 54,
    sex: 'Female',
    dialysisVintage: 18,
    primaryDiagnosis: 'Diabetic Nephropathy',
    schedule: { daysPerWeek: 3, durationPerSession: 210 },
    riskLevel: 'Medium',
    mortalityRisk: { '30d': 8.5, '90d': 18.2, '1yr': 42.5 },
    hospitalizationRisk: { '30d': 12.8, '90d': 28.5 },
    mortalityDelta: { '30d': 1.2, '90d': 2.8, '1yr': 5.5 },
    alerts: [
      { id: 'A4', type: 'Missed Sessions', severity: 'warning', description: '8% missed rate', timestamp: '2026-02-05T11:00:00Z' },
      { id: 'A5', type: 'Hyperkalemia', severity: 'warning', description: 'K+ 5.4 mEq/L', timestamp: '2026-02-04T10:00:00Z' },
    ],
    topRiskFactor: 'The Non-Adherent',
    phenotype: ['Age 54', 'Female', 'DM+', 'Transport issues', '18mo vintage', 'High K+'],
    lastUpdated: '2026-02-06T13:00:00Z',
    facility: 'Center B',
    accessType: 'AVF',
    archetype: 'The Non-Adherent (missed/shortened)',
  },
  {
    id: 'HD-1011',
    name: 'Robert Smith',
    age: 61,
    sex: 'Male',
    dialysisVintage: 28,
    primaryDiagnosis: 'Hypertensive Nephropathy',
    schedule: { daysPerWeek: 3, durationPerSession: 240 },
    riskLevel: 'High',
    mortalityRisk: { '30d': 15.8, '90d': 38.2, '1yr': 71.8 },
    hospitalizationRisk: { '30d': 22.5, '90d': 48.6 },
    mortalityDelta: { '30d': 4.2, '90d': 8.5, '1yr': 14.2 },
    alerts: [
      { id: 'A7', type: 'CVC Infection Risk', severity: 'critical', description: 'CVC 164 days - infection pathway active', timestamp: '2026-02-06T09:00:00Z' },
      { id: 'A8', type: 'Low Albumin', severity: 'warning', description: 'Albumin 3.1 g/dL', timestamp: '2026-02-05T08:00:00Z' },
      { id: 'A9', type: 'Inflammation', severity: 'warning', description: 'CRP elevated', timestamp: '2026-02-04T10:00:00Z' },
    ],
    topRiskFactor: 'Inflamed CVC',
    phenotype: ['Age 61', 'Male', 'CVC 5mo', 'Low Alb', '28mo vintage', 'Inflammation+'],
    lastUpdated: '2026-02-06T12:00:00Z',
    facility: 'Center C',
    accessType: 'CVC',
    archetype: 'Inflamed CVC (infection burden)',
  },
  {
    id: 'HD-1024',
    name: 'Michael Davis',
    age: 72,
    sex: 'Male',
    dialysisVintage: 44,
    primaryDiagnosis: 'Diabetic Nephropathy',
    schedule: { daysPerWeek: 3, durationPerSession: 240 },
    riskLevel: 'High',
    mortalityRisk: { '30d': 14.2, '90d': 35.6, '1yr': 69.2 },
    hospitalizationRisk: { '30d': 19.8, '90d': 45.2 },
    mortalityDelta: { '30d': 3.8, '90d': 7.2, '1yr': 13.5 },
    alerts: [
      { id: 'A10', type: 'Access Stenosis', severity: 'critical', description: 'VP slope +4.2 mmHg/session', timestamp: '2026-02-06T10:00:00Z' },
      { id: 'A11', type: 'Inadequacy', severity: 'warning', description: 'Mean VP 185 mmHg', timestamp: '2026-02-05T09:00:00Z' },
      { id: 'A12', type: 'Recirculation', severity: 'warning', description: 'Access flow limitation', timestamp: '2026-02-04T08:00:00Z' },
    ],
    topRiskFactor: 'The Clotter',
    phenotype: ['Age 72', 'Male', 'AVG', 'Rising VP', '44mo vintage', 'Stenosis risk'],
    lastUpdated: '2026-02-06T11:00:00Z',
    facility: 'Center A',
    accessType: 'AVG',
    archetype: 'The Clotter (Access stenosis)',
  },
  {
    id: 'HD-1058',
    name: 'Sarah Wilson',
    age: 58,
    sex: 'Female',
    dialysisVintage: 36,
    primaryDiagnosis: 'Glomerulonephritis',
    schedule: { daysPerWeek: 3, durationPerSession: 240 },
    riskLevel: 'Medium',
    mortalityRisk: { '30d': 5.2, '90d': 15.8, '1yr': 38.5 },
    hospitalizationRisk: { '30d': 8.5, '90d': 22.4 },
    mortalityDelta: { '30d': 0.8, '90d': 2.1, '1yr': 4.2 },
    alerts: [
      { id: 'A13', type: 'Malnutrition', severity: 'warning', description: 'Albumin 3.2 g/dL', timestamp: '2026-02-06T09:00:00Z' },
      { id: 'A14', type: 'Anemia', severity: 'warning', description: 'Hb 9.8 g/dL', timestamp: '2026-02-05T10:00:00Z' },
    ],
    topRiskFactor: 'Malnourished/Inflamed',
    phenotype: ['Age 58', 'Female', 'Low Alb', 'Anemia', '36mo vintage', 'Nutrition deficit'],
    lastUpdated: '2026-02-06T10:00:00Z',
    facility: 'Center B',
    accessType: 'AVF',
    archetype: 'Malnourished/Inflamed (low Alb)',
  },
  {
    id: 'HD-1003',
    name: 'Jennifer Brown',
    age: 52,
    sex: 'Female',
    dialysisVintage: 24,
    primaryDiagnosis: 'Polycystic Kidney Disease',
    schedule: { daysPerWeek: 3, durationPerSession: 240 },
    riskLevel: 'Low',
    mortalityRisk: { '30d': 2.1, '90d': 7.8, '1yr': 21.5 },
    hospitalizationRisk: { '30d': 4.2, '90d': 12.5 },
    mortalityDelta: { '30d': -0.3, '90d': -1.2, '1yr': -2.5 },
    alerts: [
      { id: 'A16', type: 'Routine Review', severity: 'info', description: 'Stable - routine monthly review', timestamp: '2026-02-06T09:00:00Z' },
    ],
    topRiskFactor: 'None',
    phenotype: ['Age 52', 'Female', 'DM-', 'HTN-', 'AVF', '24mo vintage', 'Stable'],
    lastUpdated: '2026-02-06T11:00:00Z',
    facility: 'Center C',
    accessType: 'AVF',
    archetype: 'Stable',
  },
];

export const generateMockSessions = (patientId: string): SessionData[] => {
  const sessions: SessionData[] = [];
  
  // Get base values based on patient archetype
  const patient = mockPatients.find(p => p.id === patientId);
  const baseWeight = patient?.id === 'HD-1058' ? 58 : patient?.id === 'HD-1077' ? 72 : 68;
  const baseVP = patient?.id === 'HD-1024' ? 165 : 140;
  
  // Generate dates from August 2025 to February 2026
  const startDate = new Date('2025-08-01');
  const endDate = new Date('2026-02-06');
  
  for (let i = 0; i < 40; i++) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - i * 2);
    
    // Check if date is within range
    if (date < startDate) break;
    
    const idwg = baseWeight * (0.025 + Math.random() * 0.035);
    const ufVolume = idwg * (0.8 + Math.random() * 0.2);
    const hasEvent = Math.random() < 0.25;
    const events: string[] = [];
    
    if (hasEvent) {
      const possibleEvents = ['None', 'Hypotension', 'Cramping', 'Nausea', 'Headache'];
      const event = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
      if (event !== 'None') events.push(event);
    }
    
    // IDH crasher has more terminations
    const terminatedEarly = patient?.id === 'HD-1074' 
      ? Math.random() < 0.35 
      : Math.random() < 0.08;
    const duration = terminatedEarly ? 150 + Math.random() * 60 : 225 + Math.random() * 30;
    
    sessions.push({
      date: date.toISOString().split('T')[0],
      startTime: '06:00',
      endTime: terminatedEarly ? '08:30' : '10:00',
      duration: Math.round(duration),
      prescribedDuration: 240,
      ufVolume: Math.round(ufVolume * 10) / 10,
      preWeight: Math.round((baseWeight + idwg) * 10) / 10,
      postWeight: Math.round(baseWeight * 10) / 10,
      idwg: Math.round(idwg * 10) / 10,
      preSBP: Math.round(135 + Math.random() * 30),
      preDBP: Math.round(78 + Math.random() * 15),
      nadirSBP: Math.round(88 + Math.random() * 22),
      postSBP: Math.round(128 + Math.random() * 18),
      postDBP: Math.round(72 + Math.random() * 10),
      vp: Math.round(baseVP + i * (patient?.id === 'HD-1024' ? 0.8 : 0.3) + Math.random() * 15),
      bfr: Math.round(300 + Math.random() * 50),
      spktv: Math.round((1.15 + Math.random() * 0.35) * 100) / 100,
      events,
      terminatedEarly,
      terminationReason: terminatedEarly ? 'Hypotension' : undefined,
    });
  }
  
  return sessions;
};

export const mockLabResults: LabResult[] = [
  { name: 'Hemoglobin', value: 8.8, unit: 'g/dL', date: '2026-02-01', previousValue: 9.2, targetMin: 10, targetMax: 11.5, status: 'critical' },
  { name: 'Albumin', value: 2.9, unit: 'g/dL', date: '2026-02-01', previousValue: 3.1, targetMin: 3.5, targetMax: 5.0, status: 'critical' },
  { name: 'Potassium', value: 6.2, unit: 'mEq/L', date: '2026-02-01', previousValue: 5.8, targetMin: 3.5, targetMax: 5.0, status: 'critical' },
  { name: 'Phosphorus', value: 6.8, unit: 'mg/dL', date: '2026-02-01', previousValue: 6.2, targetMin: 2.5, targetMax: 4.5, status: 'critical' },
  { name: 'Calcium', value: 8.7, unit: 'mg/dL', date: '2026-02-01', previousValue: 8.9, targetMin: 8.5, targetMax: 10.5, status: 'normal' },
  { name: 'PTH', value: 485, unit: 'pg/mL', date: '2025-12-15', previousValue: 520, targetMin: 150, targetMax: 300, status: 'warning' },
  { name: 'Ferritin', value: 245, unit: 'ng/mL', date: '2026-02-01', previousValue: 198, targetMin: 200, targetMax: 500, status: 'normal' },
  { name: 'TSAT', value: 28, unit: '%', date: '2026-02-01', previousValue: 24, targetMin: 20, targetMax: 50, status: 'normal' },
  { name: 'CRP', value: 12.5, unit: 'mg/L', date: '2026-02-01', previousValue: 8.2, targetMin: 0, targetMax: 3, status: 'critical' },
  { name: 'Bicarbonate', value: 19.2, unit: 'mEq/L', date: '2026-02-01', previousValue: 20.1, targetMin: 22, targetMax: 26, status: 'warning' },
];

export const mockMedications: Medication[] = [
  { name: 'Sevelamer', dose: '800mg', frequency: 'TID', route: 'PO', category: 'Phosphate Binders', startDate: '2025-06-01' },
  { name: 'Epoetin alfa', dose: '6000 units', frequency: 'x3/week', route: 'IV', category: 'ESA', startDate: '2025-03-15' },
  { name: 'Iron sucrose', dose: '100mg', frequency: 'Weekly', route: 'IV', category: 'Iron Supplements', startDate: '2025-08-01' },
  { name: 'Amlodipine', dose: '5mg', frequency: 'Daily', route: 'PO', category: 'BP Medications', startDate: '2024-01-10' },
  { name: 'Metoprolol', dose: '25mg', frequency: 'BID', route: 'PO', category: 'BP Medications', startDate: '2024-03-20' },
  { name: 'Sodium zirconium cyclosilicate', dose: '10g', frequency: 'Daily', route: 'PO', category: 'K Binders', startDate: '2025-12-01' },
  { name: 'Midodrine', dose: '5mg', frequency: 'Pre-HD', route: 'PO', category: 'IDH Support', startDate: '2025-11-15' },
];

export const mockAccessInfo: AccessInfo = {
  type: 'CVC',
  location: 'Right Internal Jugular',
  insertionDate: '2025-08-15',
  age: 5.4,
  history: [
    'AVF (left arm) - failed maturation',
    'AVG (right arm) - thrombosis',
  ],
};

export const mockAccessMetrics: AccessMetrics = {
  vpSlope: 4.2,
  meanVP: 185,
  alarmsPerSession: 2.3,
  bleedingEvents: 3,
  cannulationDifficulty: 25,
  recirculationRate: 8,
};

export const mockClinicalEvents: ClinicalEvent[] = [
  { id: 'E1', date: '2026-01-05', type: 'Hospitalization', description: 'Pneumonia - 5 days admission', severity: 'High', outcome: 'Resolved' },
  { id: 'E2', date: '2025-12-12', type: 'Access Procedure', description: 'Fistulogram - 50% stenosis identified', severity: 'High', outcome: 'Referred for intervention' },
  { id: 'E3', date: '2025-11-20', type: 'Infection', description: 'CVC exit site erythema', severity: 'Moderate', outcome: 'Treated with antibiotics' },
  { id: 'E4', date: '2025-10-15', type: 'Cardiac', description: 'Chest pain - troponin negative', severity: 'High', outcome: 'Ruled out MI' },
  { id: 'E5', date: '2025-09-08', type: 'ED Visit', description: 'Hyperkalemia evaluation', severity: 'Moderate', outcome: 'Treated and discharged' },
];

export const mockTasks: Task[] = [
  { id: 'T1', description: 'Schedule fistulogram', priority: 'Urgent', assignedTo: 'Dr. Patel', dueDate: '2026-02-07', status: 'Pending', createdDate: '2026-02-06' },
  { id: 'T2', description: 'Increase session time to 4.5hrs', priority: 'High', assignedTo: 'Nurse R', dueDate: '2026-02-08', status: 'Pending', createdDate: '2026-02-06' },
  { id: 'T3', description: 'Dietitian referral for malnutrition', priority: 'High', assignedTo: 'Care Coordinator', dueDate: '2026-02-09', status: 'Pending', createdDate: '2026-02-05' },
  { id: 'T4', description: 'Review K+ with nephrologist', priority: 'Medium', assignedTo: 'Dr. Patel', dueDate: '2026-02-10', status: 'Pending', createdDate: '2026-02-04' },
];

export const mockCarePlan: CarePlan = {
  activeProblems: [
    'Volume overload with recurrent IDH',
    'Access dysfunction - AVG with rising VP',
    'Metabolic instability - hyperkalemia',
    'Malnutrition - low albumin',
    'Inflammation/infection risk - prolonged CVC',
  ],
  goals: [
    'Reduce IDH rate to <20% within 4 weeks',
    'Achieve spKt/V >1.4 consistently',
    'Stabilize albumin >3.5 g/dL',
    'Transition CVC to permanent access within 3 months',
    'Improve adherence to >95% session completion',
  ],
  upcomingProcedures: [
    'Fistulogram with possible angioplasty',
    'Nutrition consultation',
    'Social work evaluation for transport barriers',
  ],
};

export const mockRecommendations: Recommendation[] = [
  { 
    id: 'R1', 
    rank: 1, 
    description: 'Schedule urgent fistulogram', 
    targetMediator: 'Access failure', 
    expectedMortalityReduction: 4.2, 
    feasibility: 'Easy', 
    urgency: 'Urgent',
    category: 'Access',
    rationale: 'Rising VP slope +4.2 mmHg/session indicates significant stenosis'
  },
  { 
    id: 'R2', 
    rank: 2, 
    description: 'Initiate IDH mitigation bundle', 
    targetMediator: 'IDH burden', 
    expectedMortalityReduction: 3.8, 
    feasibility: 'Easy', 
    urgency: 'Urgent',
    category: 'Hemodynamics',
    rationale: '55% IDH rate driving hemodynamic instability'
  },
  { 
    id: 'R3', 
    rank: 3, 
    description: 'Extra session this week for volume', 
    targetMediator: 'Volume stress', 
    expectedMortalityReduction: 3.2, 
    feasibility: 'Moderate', 
    urgency: 'Urgent',
    category: 'Volume',
    rationale: 'High UF demand (>13 ml/kg/hr) requires distribution'
  },
  { 
    id: 'R4', 
    rank: 4, 
    description: 'Switch to 2K bath and optimize binders', 
    targetMediator: 'Metabolic instability', 
    expectedMortalityReduction: 2.8, 
    feasibility: 'Easy', 
    urgency: 'Routine',
    category: 'Electrolytes',
    rationale: 'K+ 6.2 mEq/L with arrhythmia risk'
  },
  { 
    id: 'R5', 
    rank: 5, 
    description: 'CVC exit plan and infection audit', 
    targetMediator: 'Inflammation', 
    expectedMortalityReduction: 5.5, 
    feasibility: 'Complex', 
    urgency: 'Urgent',
    category: 'Access',
    rationale: '164-day CVC with infection pathway activation'
  },
];

export const mockCausalPathway: CausalPathway = {
  phenotype: [
    { label: 'Age', value: '68 years' },
    { label: 'Access', value: 'AVG with stenosis' },
    { label: 'Comorbidity', value: 'CHF, DM, HTN' },
    { label: 'Risk', value: 'High mortality' },
  ],
  mediators: [
    { name: 'Volume/UFR stress', activation: 0.82, factors: ['High IDWG', 'Short sessions', 'High UF rate'] },
    { name: 'IDH burden', activation: 0.75, factors: ['55% IDH rate', 'CHF', 'Rapid UF'] },
    { name: 'Access failure risk', activation: 0.68, factors: ['Rising VP', 'Alarms', 'Recirculation'] },
    { name: 'Metabolic instability', activation: 0.72, factors: ['HyperK', 'High Phos', 'Non-adherence'] },
    { name: 'Inflammation/Infection', activation: 0.65, factors: ['Prolonged CVC', 'Low Alb', 'CRP elevated'] },
  ],
  dominantPathway: 'Hemodynamic collapse (UFR → IDH → perfusion)',
  narrative: 'This patient exhibits classic hemodynamic crasher phenotype with high UF demands overwhelming cardiac reserve, leading to recurrent IDH and perfusion stress. Access dysfunction and metabolic instability compound the risk profile.',
};

// Utility function to generate sparkline data
export const generateSparklineData = (count: number): number[] => {
  const data: number[] = [];
  let value = 50;
  
  for (let i = 0; i < count; i++) {
    // Random walk with slight upward/downward trend
    const change = (Math.random() - 0.5) * 20;
    value = Math.max(10, Math.min(90, value + change));
    data.push(Math.round(value));
  }
  
  return data;
};
