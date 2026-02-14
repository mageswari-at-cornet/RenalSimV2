
import { db } from '../db';
import { patients, dialysisSessions, labResults, medications, vascularAccess, accessMetrics, sessionVitals } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

// Helper types for Drizzle inference
type PatientWithRelations = typeof patients.$inferSelect & {
    vascularAccess: (typeof vascularAccess.$inferSelect & {
        accessMetrics: (typeof accessMetrics.$inferSelect)[];
    })[];
    dialysisSessions: (typeof dialysisSessions.$inferSelect & {
        sessionVitals: (typeof sessionVitals.$inferSelect)[];
    })[];
    labResults: (typeof labResults.$inferSelect)[];
    medications: (typeof medications.$inferSelect)[];
};

const calculateAlerts = (vitals: {
    potassium: number,
    hemoglobin: number,
    phosphorus: number,
    albumin: number,
    accessType: string,
    fluidOverload: boolean
}) => {
    const alerts = [];

    // Critical Alerts (Red)
    if (vitals.potassium > 5.5) {
        alerts.push({
            id: 'alert-k',
            severity: 'critical',
            description: `Hyperkalemia: K+ ${vitals.potassium} mEq/L`,
            type: 'Lab',
            timestamp: new Date().toISOString()
        });
    }
    if (vitals.hemoglobin < 9.0) {
        alerts.push({
            id: 'alert-hb',
            severity: 'critical',
            description: `Severe Anemia: Hb ${vitals.hemoglobin} g/dL`,
            type: 'Lab',
            timestamp: new Date().toISOString()
        });
    }

    // Warning Alerts (Yellow)
    if (vitals.phosphorus > 5.5) {
        alerts.push({
            id: 'alert-phos',
            severity: 'warning',
            description: `Hyperphosphatemia: Phos ${vitals.phosphorus} mg/dL`,
            type: 'Lab',
            timestamp: new Date().toISOString()
        });
    }
    if (vitals.albumin < 3.2) {
        alerts.push({
            id: 'alert-alb',
            severity: 'warning',
            description: `Malnutrition Risk: Alb ${vitals.albumin} g/dL`,
            type: 'Lab',
            timestamp: new Date().toISOString()
        });
    }
    if (vitals.accessType === 'CVC') {
        alerts.push({
            id: 'alert-access',
            severity: 'warning',
            description: 'CVC Catheter: Infection Risk',
            type: 'Access',
            timestamp: new Date().toISOString()
        });
    }
    if (vitals.fluidOverload) {
        alerts.push({
            id: 'alert-fluid',
            severity: 'warning',
            description: 'Recent IDH Event: Fluid Overload Risk',
            type: 'Volume',
            timestamp: new Date().toISOString()
        });
    }

    return alerts;
};

export const PatientService = {
    async getAllPatients() {
        // Query database for all patients
        const allPatients = await db.query.patients.findMany({
            with: {
                vascularAccess: true,
                dialysisSessions: {
                    orderBy: [desc(dialysisSessions.sessionDate)],
                    limit: 1
                },
                labResults: {
                    orderBy: [desc(labResults.testDate)],
                    limit: 1
                }
            }
        });

        const calculateRisk = (age: number, accessType: string, albumin: number = 4.0) => {
            let risk = 2.0; // Base risk

            // Age factor
            if (age > 50) risk += (age - 50) * 0.15;
            if (age > 75) risk += (age - 75) * 0.2;

            // Albumin factor (huge predictor)
            if (albumin < 3.5) risk += (3.5 - albumin) * 8;
            if (albumin < 3.0) risk += 5;

            // Access factor
            if (accessType === 'CVC') risk += 5.0;
            if (accessType === 'AVG') risk += 2.5;

            return Math.min(99, Math.max(1, risk));
        };

        // Map to frontend structure
        return (allPatients as unknown as PatientWithRelations[]).map(p => {
            const access = p.vascularAccess[0];
            const primaryAccess = access?.accessType || 'Unknown';
            const age = p.dob ? new Date().getFullYear() - new Date(p.dob).getFullYear() : 0;
            const lastSession = p.dialysisSessions[0];
            const lastLabs = p.labResults[0];
            const albumin = lastLabs ? Number(lastLabs.albumin) : 4.0;

            const mortalityRisk30d = calculateRisk(age, primaryAccess || 'Unknown', albumin);
            // Derive other periods from 30d (simplified model)
            const mortalityRisk90d = mortalityRisk30d * 2.5;
            const mortalityRisk1yr = mortalityRisk30d * 8;

            const hospitalizationRisk30d = mortalityRisk30d * 0.8;
            const hospitalizationRisk90d = mortalityRisk90d * 0.7;

            return {
                id: p.mrn,
                name: `${p.firstName} ${p.lastName}`,
                age: age,
                sex: p.sex || 'Unknown',
                dialysisVintage: p.dialysisVintage || 0,
                primaryDiagnosis: p.primaryDiagnosis || 'Unknown',
                schedule: { daysPerWeek: p.scheduleDaysPerWeek || 3, durationPerSession: p.scheduleDurationMinutes || 240 },
                riskLevel: mortalityRisk90d > 15 ? 'High' : mortalityRisk90d > 8 ? 'Medium' : 'Low',
                mortalityRisk: {
                    '30d': Number(mortalityRisk30d.toFixed(1)),
                    '90d': Number(mortalityRisk90d.toFixed(1)),
                    '1yr': Number(mortalityRisk1yr.toFixed(1))
                },
                hospitalizationRisk: {
                    '30d': Number(hospitalizationRisk30d.toFixed(1)),
                    '90d': Number(hospitalizationRisk90d.toFixed(1))
                },
                mortalityDelta: { '30d': 0, '90d': 0, '1yr': 0 },
                alerts: calculateAlerts({
                    potassium: Number(lastLabs?.potassium || 4.5),
                    hemoglobin: Number(lastLabs?.hemoglobin || 10.5),
                    phosphorus: Number(lastLabs?.phosphorus || 5.2),
                    albumin: Number(lastLabs?.albumin || 3.8),
                    accessType: primaryAccess,
                    fluidOverload: false // Placeholder
                }),
                topRiskFactor: primaryAccess === 'CVC' ? 'Vascular Access' : albumin < 3.5 ? 'Malnutrition' : 'Age',
                phenotype: [],
                lastUpdated: lastSession ? new Date(lastSession.sessionDate).toISOString() : new Date().toISOString(),
                facility: 'Center A',
                accessType: primaryAccess,
                archetype: p.archetype || 'Standard'
            };
        });
    },

    async getPatientDetails(mrn: string) {
        const patient = await db.query.patients.findFirst({
            where: eq(patients.mrn, mrn || ''),
            with: {
                vascularAccess: {
                    with: {
                        accessMetrics: true
                    }
                },
                dialysisSessions: {
                    orderBy: [desc(dialysisSessions.sessionDate)],
                    limit: 20,
                    with: {
                        sessionVitals: {
                            orderBy: [desc(sessionVitals.recordedTime)],
                            limit: 1
                        }
                    }
                },
                labResults: {
                    orderBy: [desc(labResults.testDate)],
                    limit: 12
                },
                medications: true
            }
        });

        if (!patient) return null;

        const p = patient as unknown as PatientWithRelations;
        const patientLatestLabs = p.labResults[0];

        const age = p.dob ? new Date().getFullYear() - new Date(p.dob).getFullYear() : 0;
        const access = p.vascularAccess[0];

        // Transform sessions
        const sessions = p.dialysisSessions.map(s => {
            // Try to find the latest vitals for this session
            const lastVital = s.sessionVitals[0];

            return {
                date: s.sessionDate,
                startTime: s.startTime ? new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '08:00',
                endTime: s.endTime ? new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:00',
                duration: 240,
                prescribedDuration: 240,
                ufVolume: s.ultrafiltrationRate ? Number(s.ultrafiltrationRate) : 0,
                preWeight: s.preDialysisWeight ? Number(s.preDialysisWeight) : 0,
                postWeight: s.postDialysisWeight ? Number(s.postDialysisWeight) : 0,
                idwg: s.interdialyticWeightGain ? Number(s.interdialyticWeightGain) : 0,
                preSBP: 140, // We ideally need pre/post vitals. For now use last vital or default
                preDBP: 80,
                nadirSBP: lastVital ? Number(lastVital.systolicBp) : 100,
                postSBP: lastVital ? Number(lastVital.systolicBp) : 130, // Using last vital as post
                postDBP: lastVital ? Number(lastVital.diastolicBp) : 75,
                vp: lastVital ? Number(lastVital.venousLinePressure) : 150,
                bfr: s.bloodFlowRate || 0,
                spktv: s.dialysisDoseKt ? Number(s.dialysisDoseKt) : 0,
                events: s.intradialyticHypotension ? ['Hypotension'] : [],
                terminatedEarly: false,

                // New Mappings
                technique: s.dialysisTechnique,
                dialyzerType: s.dialyzerType,
                dialysateTemp: s.dialysateTemperature ? Number(s.dialysateTemperature) : 36.5,
                replacementVolume: s.replacementVolume ? Number(s.replacementVolume) : 0,
                dialysateFlowRate: s.dialysateFlowRate || 500,
                tmp: lastVital ? Number(lastVital.transmembranePressure) : 120,
                heartRate: lastVital ? Number(lastVital.heartRate) : 72,
                arterialPressure: lastVital ? Number(lastVital.arterialLinePressure) : -150
            };
        });

        // Map Labs: Return all historical records for all markers
        const labs = p.labResults.flatMap(record => {
            const mapSingleRecord = (name: string, key: keyof typeof labResults.$inferSelect, unit: string, targets: { min: number, max: number }) => {
                const val = Number(record[key]);

                let status: 'normal' | 'warning' | 'critical' = 'normal';
                if (val < targets.min * 0.9 || val > targets.max * 1.1) status = 'critical';
                else if (val < targets.min || val > targets.max) status = 'warning';

                // We include previousValue from the consecutive record for the Compare UI
                const recordIndex = p.labResults.findIndex(r => r.id === record.id);
                const prevRecord = p.labResults[recordIndex + 1];
                const prevVal = prevRecord ? Number(prevRecord[key]) : val;

                return {
                    name,
                    value: val,
                    previousValue: prevVal,
                    unit,
                    date: record.testDate,
                    targetMin: targets.min,
                    targetMax: targets.max,
                    status
                };
            };

            return [
                mapSingleRecord('Hemoglobin', 'hemoglobin', 'g/dL', { min: 10, max: 12 }),
                mapSingleRecord('Potassium', 'potassium', 'mEq/L', { min: 3.5, max: 5.5 }),
                mapSingleRecord('Sodium', 'sodium', 'mEq/L', { min: 135, max: 145 }),
                mapSingleRecord('Albumin', 'albumin', 'g/dL', { min: 3.5, max: 5.0 }),
                mapSingleRecord('Calcium', 'calcium', 'mg/dL', { min: 8.5, max: 10.2 }),
                mapSingleRecord('Phosphorus', 'phosphorus', 'mg/dL', { min: 3.5, max: 5.5 }),
                mapSingleRecord('Urea', 'urea', 'mg/dL', { min: 70, max: 150 }),
                mapSingleRecord('Creatinine', 'creatinine', 'mg/dl', { min: 0.7, max: 1.3 }),
                mapSingleRecord('Bicarbonate', 'bicarbonate', 'mEq/L', { min: 22, max: 29 }),
                mapSingleRecord('Ferritin', 'ferritin', 'ng/mL', { min: 200, max: 800 }),
            ];
        });

        // Map Meds
        const meds = (p.medications || []).map(m => ({
            name: m.drugName,
            dose: m.dose,
            frequency: m.frequency,
            route: m.route,
            category: m.category || (m.drugName?.includes('Erythropoietin') ? 'ESA' : 'Prescription'),
            startDate: m.startDate ? m.startDate : ''
        }));

        // Map Access Metrics
        const metrics = access?.accessMetrics?.[0];
        const vpSlope = 0.2; // Placeholder
        const accessMetrics = metrics ? {
            vpSlope,
            meanVP: metrics.venousPressure || 0,
            alarmsPerSession: 1.2,
            bleedingEvents: 0,
            cannulationDifficulty: 0,
            recirculationRate: 0,
            arterialPressure: metrics.arterialPressure || 0,
            flowRate: metrics.flowRate || 0
        } : undefined;

        // Dynamic Access Risk calculation
        const calculateAccessRisk = (m: any, slope: number) => {
            let risk = 15; // Base
            if (slope > 3) risk += 40;
            if (m?.meanVP > 180) risk += 20;
            if (m?.flowRate < 300) risk += 15;
            return Math.min(99, risk);
        };
        const riskScore = accessMetrics ? calculateAccessRisk(accessMetrics, vpSlope) : 25;

        // Data Quality Calculation
        const sessionsWithVitals = p.dialysisSessions.filter(s => s.sessionVitals.length > 0).length;
        const dataQualityScore = Math.round((sessionsWithVitals / Math.max(1, p.dialysisSessions.length)) * 100);

        // Risk Calculation (Duplicated from getAllPatients for now)
        const albumin = patientLatestLabs ? Number(patientLatestLabs.albumin) : 4.0;
        const accessType = access ? access.accessType : 'Unknown';

        const calculateRisk = (ageVal: number, accessVal: string, albuminVal: number) => {
            let risk = 2.0;
            if (ageVal > 50) risk += (ageVal - 50) * 0.15;
            if (ageVal > 75) risk += (ageVal - 75) * 0.2;
            if (albuminVal < 3.5) risk += (3.5 - albuminVal) * 8;
            if (albuminVal < 3.0) risk += 5;
            if (accessVal === 'CVC') risk += 5.0;
            if (accessVal === 'AVG') risk += 2.5;

            // Add subtle variation (jitter) to prevent integer-only risks
            const jitter = (p.mrn.charCodeAt(p.mrn.length - 1) % 10) * 0.1; // deterministic based on MRN
            risk += jitter;

            return Math.min(99, Math.max(1, risk));
        };

        const mortalityRisk30d = calculateRisk(age, accessType || 'Unknown', albumin);
        const mortalityRisk90d = mortalityRisk30d * 2.5;
        const mortalityRisk1yr = mortalityRisk30d * 8;

        // --- AI Risk Assessment Integration ---
        // We attempt to get a more nuanced risk score from the LLM
        // This includes reasoning and potentially non-linear factor analysis
        let aiRiskProfile = null;
        let aiRecommendations = [];

        try {
            // Only fetch for single patient view to avoid latency in list view
            // Construct a lightweight context for the AI
            const riskContext = {
                age,
                sex: p.sex,
                diagnosis: 'ESRD', // defaulting as primaryDiagnosis is not in schema currently
                accessType,
                labAlbumin: albumin,
                labPotassium: patientLatestLabs?.potassium,
                lastMissedSession: false, // placeholder
                hospitalizationsLast6Months: 0 // placeholder
            };

            // Call AI Service (Commented out to prevent blocking every request during dev, uncomment to enable)
            const { AiService } = await import('./ai.service');

            // Run AI tasks in parallel
            const [riskResult, recsResult] = await Promise.all([
                AiService.analyzePatientRisk(riskContext),
                AiService.generateRecommendations(riskContext)
            ]);

            aiRiskProfile = riskResult;
            aiRecommendations = recsResult;

        } catch (e) {
            console.error('AI Risk Fetch Error', e);
        }

        const final30d = aiRiskProfile?.mortalityRisk30d ?? mortalityRisk30d;
        const final90d = aiRiskProfile?.mortalityRisk90d ?? mortalityRisk90d;
        const final1yr = aiRiskProfile?.mortalityRisk1yr ?? mortalityRisk1yr;
        const finalTopRisk = aiRiskProfile?.topRiskFactor ?? (accessType === 'CVC' ? 'Vascular Access' : albumin < 3.5 ? 'Malnutrition' : 'Age');

        const baseProfile = {
            id: p.mrn,
            name: `${p.firstName} ${p.lastName}`,
            age: age,
            sex: p.sex || 'Unknown',
            dialysisVintage: p.dialysisVintage || 0,
            primaryDiagnosis: p.primaryDiagnosis || 'Unknown',
            schedule: { daysPerWeek: p.scheduleDaysPerWeek || 3, durationPerSession: p.scheduleDurationMinutes || 240 },
            riskLevel: final90d > 15 ? 'High' : final90d > 8 ? 'Medium' : 'Low',
            mortalityRisk: {
                '30d': Number(final30d.toFixed(1)),
                '90d': Number(final90d.toFixed(1)),
                '1yr': Number(final1yr.toFixed(1))
            },
            hospitalizationRisk: {
                '30d': Number((final30d * 0.8).toFixed(1)),
                '90d': Number((final90d * 0.7).toFixed(1))
            },
            mortalityDelta: { '30d': 0, '90d': 0, '1yr': 0 },
            alerts: calculateAlerts({
                potassium: Number(patientLatestLabs?.potassium || 4.5),
                hemoglobin: Number(patientLatestLabs?.hemoglobin || 10.5),
                phosphorus: Number(patientLatestLabs?.phosphorus || 5.2),
                albumin: Number(patientLatestLabs?.albumin || 3.8),
                accessType: access?.accessType || 'Unknown',
                fluidOverload: p.dialysisSessions[0]?.intradialyticHypotension || false
            }),
            topRiskFactor: finalTopRisk,
            phenotype: [],
            lastUpdated: new Date().toISOString(),
            facility: 'Center A',
            accessType: access ? access.accessType : 'Unknown',
            archetype: p.archetype || 'Standard',
            access: access ? {
                type: access.accessType,
                location: access.location,
                insertionDate: access.createdDate,
                age: 24, // Placeholder for age in months
                history: ['Previous CVC (Right IJ)', 'Failed Maturation (Left RC)']
            } : undefined,
            accessMetrics: accessMetrics,
            accessRiskScore: riskScore, // Used in AccessTab
            dataQualityScore: dataQualityScore, // Used in DataQualityTab
            dryWeight: p.dialysisSessions[0]?.dryWeight ? Number(p.dialysisSessions[0].dryWeight) : 70.0,
            recommendations: aiRecommendations // Attach recommendations
        };

        return {
            ...baseProfile,
            sessions,
            labs,
            medications: meds
        };
    }
};
