import type { Patient, SessionData, LabResult, Medication, AccessInfo, AccessMetrics, ClinicalEvent, Task, CarePlan, Recommendation, CausalPathway } from '../types';

export const mockPatients: Patient[] = [
  {
    id: 'P001',
    name: 'Rajesh Kumar',
    age: 72,
    sex: 'Male',
    dialysisVintage: 48,
    primaryDiagnosis: 'Diabetic Nephropathy',
    schedule: { daysPerWeek: 3, durationPerSession: 240 },
    riskLevel: 'High',
    mortalityRisk: { '30d': 8.4, '90d': 28.3, '1yr': 67.2 },
    mortalityDelta: { '30d': 2.1, '90d': 4.5, '1yr': 8.2 },
    alerts: [
      { id: 'A1', type: 'IDWG Critical', severity: 'critical', description: 'IDWG >5% body weight', timestamp: '2024-01-15T10:30:00Z' },
      { id: 'A2', type: 'VP Warning', severity: 'warning', description: 'Rising venous pressure trend', timestamp: '2024-01-14T08:00:00Z' },
      { id: 'A3', type: 'Labs Due', severity: 'info', description: 'Labs due this week', timestamp: '2024-01-13T09:00:00Z' },
    ],
    topRiskFactor: 'Fluid overload',
    phenotype: ['Age 72', 'Male', 'DM+', 'HTN+', 'CVC Access', '48mo vintage', 'Prior CHF', 'Hospitalized'],
    lastUpdated: '2024-01-15T14:30:00Z',
  },
  {
    id: 'P042',
    name: 'Sita Devi',
    age: 58,
    sex: 'Female',
    dialysisVintage: 24,
    primaryDiagnosis: 'Hypertensive Nephropathy',
    schedule: { daysPerWeek: 3, durationPerSession: 240 },
    riskLevel: 'Medium',
    mortalityRisk: { '30d': 4.2, '90d': 15.8, '1yr': 42.5 },
    mortalityDelta: { '30d': -0.5, '90d': 1.2, '1yr': 2.1 },
    alerts: [
      { id: 'A4', type: 'Inadequacy', severity: 'warning', description: 'spKt/V below target', timestamp: '2024-01-14T11:00:00Z' },
    ],
    topRiskFactor: 'Inadequacy',
    phenotype: ['Age 58', 'Female', 'DM-', 'HTN+', 'AVF', '24mo vintage'],
    lastUpdated: '2024-01-15T13:00:00Z',
  },
  {
    id: 'P089',
    name: 'Ram Prasad',
    age: 65,
    sex: 'Male',
    dialysisVintage: 36,
    primaryDiagnosis: 'Diabetic Nephropathy',
    schedule: { daysPerWeek: 3, durationPerSession: 210 },
    riskLevel: 'High',
    mortalityRisk: { '30d': 12.1, '90d': 32.5, '1yr': 71.8 },
    mortalityDelta: { '30d': 3.2, '90d': 6.8, '1yr': 12.5 },
    alerts: [
      { id: 'A5', type: 'Access Critical', severity: 'critical', description: 'Recurrent thrombosis', timestamp: '2024-01-15T09:00:00Z' },
      { id: 'A6', type: 'Hypotension', severity: 'warning', description: 'IDH in 40% of sessions', timestamp: '2024-01-14T10:00:00Z' },
      { id: 'A7', type: 'Malnutrition', severity: 'warning', description: 'Albumin declining', timestamp: '2024-01-13T08:00:00Z' },
    ],
    topRiskFactor: 'Access issues',
    phenotype: ['Age 65', 'Male', 'DM+', 'HTN+', 'AVG', '36mo vintage', 'CHF+'],
    lastUpdated: '2024-01-15T12:00:00Z',
  },
  {
    id: 'P156',
    name: 'Anita Sharma',
    age: 45,
    sex: 'Female',
    dialysisVintage: 12,
    primaryDiagnosis: 'Glomerulonephritis',
    schedule: { daysPerWeek: 3, durationPerSession: 240 },
    riskLevel: 'Low',
    mortalityRisk: { '30d': 1.8, '90d': 6.5, '1yr': 18.2 },
    mortalityDelta: { '30d': -0.2, '90d': -0.8, '1yr': -1.5 },
    alerts: [],
    topRiskFactor: 'None',
    phenotype: ['Age 45', 'Female', 'DM-', 'HTN-', 'AVF', '12mo vintage'],
    lastUpdated: '2024-01-15T11:00:00Z',
  },
  {
    id: 'P203',
    name: 'Vikram Mehta',
    age: 68,
    sex: 'Male',
    dialysisVintage: 60,
    primaryDiagnosis: 'Diabetic Nephropathy',
    schedule: { daysPerWeek: 3, durationPerSession: 240 },
    riskLevel: 'High',
    mortalityRisk: { '30d': 15.2, '90d': 38.4, '1yr': 78.5 },
    mortalityDelta: { '30d': 4.8, '90d': 9.2, '1yr': 15.8 },
    alerts: [
      { id: 'A8', type: 'Infection Risk', severity: 'critical', description: 'CVC >6 months', timestamp: '2024-01-15T08:00:00Z' },
      { id: 'A9', type: 'Missed Sessions', severity: 'warning', description: '2 sessions missed', timestamp: '2024-01-14T09:00:00Z' },
      { id: 'A10', type: 'Hyperkalemia', severity: 'critical', description: 'K+ 5.8 mEq/L', timestamp: '2024-01-13T10:00:00Z' },
      { id: 'A11', type: 'Phosphorus', severity: 'warning', description: 'Phos 6.2 mg/dL', timestamp: '2024-01-13T10:00:00Z' },
    ],
    topRiskFactor: 'Infection risk',
    phenotype: ['Age 68', 'Male', 'DM+', 'HTN+', 'CVC', '60mo vintage', 'Multiple comorbidities'],
    lastUpdated: '2024-01-15T10:00:00Z',
  },
];

export const generateMockSessions = (patientId: string): SessionData[] => {
  const sessions: SessionData[] = [];
  const baseWeight = patientId === 'P001' ? 68 : patientId === 'P089' ? 72 : 65;
  const baseVP = patientId === 'P089' ? 180 : 140;
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i * 2);
    
    const idwg = baseWeight * (0.03 + Math.random() * 0.04);
    const ufVolume = idwg * (0.8 + Math.random() * 0.2);
    const hasEvent = Math.random() < 0.3;
    const events: string[] = [];
    
    if (hasEvent) {
      const possibleEvents = ['Hypotension', 'Cramping', 'Nausea', 'Headache'];
      events.push(possibleEvents[Math.floor(Math.random() * possibleEvents.length)]);
    }
    
    const terminatedEarly = Math.random() < 0.1;
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
      preSBP: Math.round(140 + Math.random() * 30),
      preDBP: Math.round(80 + Math.random() * 15),
      nadirSBP: Math.round(90 + Math.random() * 25),
      postSBP: Math.round(130 + Math.random() * 20),
      postDBP: Math.round(75 + Math.random() * 10),
      vp: Math.round(baseVP + i * 0.5 + Math.random() * 20),
      bfr: Math.round(280 + Math.random() * 40),
      spktv: Math.round((1.1 + Math.random() * 0.4) * 100) / 100,
      events,
      terminatedEarly,
      terminationReason: terminatedEarly ? 'Hypotension' : undefined,
    });
  }
  
  return sessions;
};

export const mockLabResults: LabResult[] = [
  { name: 'Hemoglobin', value: 9.8, unit: 'g/dL', date: '2024-01-10', previousValue: 10.2, targetMin: 10, targetMax: 11.5, status: 'warning' },
  { name: 'Albumin', value: 3.2, unit: 'g/dL', date: '2024-01-10', previousValue: 3.4, targetMin: 3.5, targetMax: 5.0, status: 'critical' },
  { name: 'Potassium', value: 5.8, unit: 'mEq/L', date: '2024-01-10', previousValue: 5.4, targetMin: 3.5, targetMax: 5.0, status: 'critical' },
  { name: 'Phosphorus', value: 6.2, unit: 'mg/dL', date: '2024-01-10', previousValue: 5.8, targetMin: 2.5, targetMax: 4.5, status: 'critical' },
  { name: 'Calcium', value: 8.9, unit: 'mg/dL', date: '2024-01-10', previousValue: 9.1, targetMin: 8.5, targetMax: 10.5, status: 'normal' },
  { name: 'PTH', value: 485, unit: 'pg/mL', date: '2023-12-15', previousValue: 520, targetMin: 150, targetMax: 300, status: 'warning' },
  { name: 'Ferritin', value: 245, unit: 'ng/mL', date: '2024-01-10', previousValue: 198, targetMin: 200, targetMax: 500, status: 'normal' },
  { name: 'TSAT', value: 28, unit: '%', date: '2024-01-10', previousValue: 24, targetMin: 20, targetMax: 50, status: 'normal' },
];

export const mockMedications: Medication[] = [
  { name: 'Sevelamer', dose: '800mg', frequency: 'TID', route: 'PO', category: 'Phosphate Binders', startDate: '2023-06-01' },
  { name: 'Epoetin alfa', dose: '4000 units', frequency: 'x3/week', route: 'IV', category: 'ESA', startDate: '2023-03-15' },
  { name: 'Iron sucrose', dose: '100mg', frequency: 'Weekly', route: 'IV', category: 'Iron Supplements', startDate: '2023-08-01' },
  { name: 'Amlodipine', dose: '5mg', frequency: 'Daily', route: 'PO', category: 'BP Medications', startDate: '2022-01-10' },
  { name: 'Metoprolol', dose: '25mg', frequency: 'BID', route: 'PO', category: 'BP Medications', startDate: '2022-03-20' },
];

export const mockAccessInfo: AccessInfo = {
  type: 'CVC',
  location: 'Right Internal Jugular',
  insertionDate: '2023-08-15',
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
  { id: 'E1', date: '2024-01-05', type: 'Hospitalization', description: 'Pneumonia - 5 days admission', severity: 'High', outcome: 'Resolved' },
  { id: 'E2', date: '2023-12-12', type: 'Access Procedure', description: 'Fistulogram - 50% stenosis identified', severity: 'High', outcome: 'Referred for intervention' },
  { id: 'E3', date: '2023-11-20', type: 'Infection', description: 'CVC exit site erythema', severity: 'Moderate', outcome: 'Treated with antibiotics' },
  { id: 'E4', date: '2023-10-15', type: 'Cardiac', description: 'Chest pain - troponin negative', severity: 'High', outcome: 'Ruled out MI' },
];

export const mockTasks: Task[] = [
  { id: 'T1', description: 'Schedule fistulogram', priority: 'Urgent', assignedTo: 'Dr. Patel', dueDate: '2024-01-16', status: 'Pending', createdDate: '2024-01-15' },
  { id: 'T2', description: 'Increase session time to 4.5hrs', priority: 'High', assignedTo: 'Nurse R', dueDate: '2024-01-17', status: 'Pending', createdDate: '2024-01-15' },
  { id: 'T3', description: 'Dietitian referral', priority: 'High', assignedTo: 'Care Coordinator', dueDate: '2024-01-18', status: 'Pending', createdDate: '2024-01-14' },
  { id: 'T4', description: 'Review K+ with nephrologist', priority: 'Medium', assignedTo: 'Dr. Patel', dueDate: '2024-01-22', status: 'Pending', createdDate: '2024-01-13' },
];

export const mockCarePlan: CarePlan = {
  activeProblems: [
    'Fluid overload',
    'Inadequate dialysis (spKt/V)',
    'CVC access - high infection risk',
    'Intradialytic hypotension',
    'Malnutrition (albumin 3.2)',
  ],
  goals: [
    'Achieve dry weight 64.5kg',
    'spKt/V >1.4 consistently',
    'BP stability during HD',
    'Albumin >3.5 g/dL',
  ],
  upcomingProcedures: [
    'Fistulogram - Jan 16',
    'Nephrology follow-up - Jan 20',
    'Access evaluation - Jan 25',
  ],
};

export const mockRecommendations: Recommendation[] = [
  { id: 'R1', rank: 1, description: 'Reduce dry weight by 0.5kg', targetMediator: 'Fluid overload', expectedMortalityReduction: 3.2, feasibility: 'Easy', urgency: 'Urgent', category: 'Fluid Management', rationale: 'Current IDWG averaging 3.2kg (5.2% of body weight). Reducing target weight will improve hemodynamic stability.' },
  { id: 'R2', rank: 2, description: 'Increase session time to 4.5 hours', targetMediator: 'Inadequacy', expectedMortalityReduction: 2.8, feasibility: 'Moderate', urgency: 'Routine', category: 'Adequacy', rationale: 'Current mean spKt/V 1.32, target ≥1.40. Additional 30 minutes will improve clearance.' },
  { id: 'R3', rank: 3, description: 'Schedule access evaluation', targetMediator: 'Access failure', expectedMortalityReduction: 2.1, feasibility: 'Moderate', urgency: 'Urgent', category: 'Access', rationale: 'Rising VP trend (+4.2 mmHg/session) indicates stenosis risk. Early intervention can prevent thrombosis.' },
  { id: 'R4', rank: 4, description: 'Initiate midodrine for IDH', targetMediator: 'Hemodynamic instability', expectedMortalityReduction: 1.9, feasibility: 'Easy', urgency: 'Routine', category: 'Hemodynamics', rationale: 'IDH in 33% of sessions. Midodrine can improve hemodynamic tolerance.' },
  { id: 'R5', rank: 5, description: 'Refer to dietitian', targetMediator: 'Malnutrition', expectedMortalityReduction: 1.4, feasibility: 'Easy', urgency: 'Routine', category: 'Nutrition', rationale: 'Albumin 3.2 g/dL, declining trend. Nutritional intervention needed.' },
];

export const mockCausalPathway: CausalPathway = {
  phenotype: [
    { label: 'Age', value: '72' },
    { label: 'Sex', value: 'Male' },
    { label: 'DM', value: 'Positive' },
    { label: 'HTN', value: 'Positive' },
    { label: 'Access', value: 'CVC' },
    { label: 'Vintage', value: '48mo' },
  ],
  mediators: [
    { name: 'Fluid overload', activation: 78, factors: ['High IDWG', 'Diabetic cardiomyopathy', 'Aggressive UF'] },
    { name: 'Inadequate dialysis', activation: 65, factors: ['spKt/V 1.32', 'CVC flow limitation', 'Session time shortfall'] },
    { name: 'Access failure risk', activation: 72, factors: ['CVC use', 'Rising VP trend', 'Prior thrombosis'] },
    { name: 'Hemodynamic instability', activation: 58, factors: ['IDH events', 'Nadir SBP <100', 'BP variability'] },
    { name: 'Malnutrition', activation: 45, factors: ['Albumin 3.2', 'Weight loss', 'Poor appetite'] },
    { name: 'Infection risk', activation: 62, factors: ['CVC presence', 'Prolonged use', 'Recent hospitalization'] },
  ],
  dominantPathway: 'Fluid overload',
  narrative: 'This patient\'s high mortality risk is primarily driven by severe fluid overload (78% activation). The combination of diabetic cardiomyopathy, high interdialytic weight gains (averaging 3.2kg), and aggressive UF requirements create hemodynamic stress. This is compounded by access issues (CVC with rising venous pressures) limiting adequate dialysis delivery.',
};

export const generateSparklineData = (points: number = 12): number[] => {
  return Array.from({ length: points }, () => 20 + Math.random() * 15);
};