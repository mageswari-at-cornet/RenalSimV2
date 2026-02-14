import OpenAI from 'openai';


export const AiService = {
    async analyzePatientRisk(patient: any) {
        const openai = new OpenAI({
            apiKey: process.env.GROK_API_KEY,
            baseURL: 'https://api.groq.com/openai/v1',
        });

        try {
            const systemPrompt = `You are a Nephrologist Risk Assessment AI. 
            Analyze the patient data and estimate the 30-day mortality risk (percentage 0-100).
            
            Risk Factors to consider:
            - Age > 65
            - Albumin < 3.5 g/dL (Malnutrition)
            - Access Type: CVC (High Risk) vs AVF (Lower Risk)
            - Recent Hospitalizations or Hypotension events.

            Return ONLY a JSON object:
            {
                "mortalityRisk30d": number,
                "mortalityRisk90d": number,
                "mortalityRisk1yr": number,
                "topRiskFactor": "string",
                "explanation": "string"
            }
            Do not include markdown formatting.`;

            const completion = await openai.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: JSON.stringify(patient, null, 2) }
                ],
                model: 'llama-3.1-8b-instant',
                temperature: 0.1,
            });

            const content = completion.choices[0].message.content || '{}';
            // Clean markdown if present
            const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);

        } catch (error) {
            console.error('AI Risk Analysis Failed:', error);
            // Fallback to default structure if AI fails
            return null;
        }
    },

    async generateRecommendations(patient: any) {
        const openai = new OpenAI({
            apiKey: process.env.GROK_API_KEY,
            baseURL: 'https://api.groq.com/openai/v1',
        });

        try {
            const systemPrompt = `You are an expert Nephrologist providing strict, valid clinical recommendations for a dialysis patient.
            
            Based on the patient's data, generate the TOP 5 recommendations to reduce mortality and hospitalization risk.
            Rules:
            1. Recommendations must be clinically valid and actionable.
            2. Focus on: Volume Control, Access Management, Medication Optimization (Phosphate binders, Calcimimetics), and Nutrition.
            3. "rank" should be 1 to 5.
            4. "feasibility" must be "Easy", "Moderate", or "Hard".
            5. "urgency" must be "Urgent", "High", or "Medium".
            6. "category" must be "Medical", "Operational", or "Lifestyle".

            Return ONLY a JSON array of objects with this schema:
            [
                {
                    "id": string (unique),
                    "rank": number,
                    "description": string (concise),
                    "targetMediator": string (e.g., "Potassium", "Fluid Overload", "Access Infection"),
                    "expectedMortalityReduction": number (estimated percentage, e.g., 2.5),
                    "feasibility": "Easy" | "Moderate" | "Hard",
                    "urgency": "Urgent" | "High" | "Medium",
                    "category": "Medical" | "Operational" | "Lifestyle"
                }
            ]
            Do not include markdown formatting.`;

            const completion = await openai.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: JSON.stringify(patient, null, 2) }
                ],
                model: 'llama-3.1-8b-instant',
                temperature: 0.2,
            });

            const content = completion.choices[0].message.content || '[]';
            const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(jsonStr);

        } catch (error) {
            console.error('AI Recommendations Failed:', error);
            return [];
        }
    },


    async predictInterventionImpact(patient: any, activeLevers: any) {
        const openai = new OpenAI({
            apiKey: process.env.GROK_API_KEY,
            baseURL: 'https://api.groq.com/openai/v1',
        });

        try {
            // Format Patient Context
            const lastSession = patient.sessions?.[0] || {};
            const labs = patient.labResults?.[0] || {};

            const contextString = `
            Patient Profile:
            - Name: ${patient.firstName} ${patient.lastName} (${patient.age}y ${patient.sex})
            - Diagnosis: ${patient.primaryDiagnosis}
            - Vintage: ${patient.dialysisVintage} months
            - Access: ${patient.access?.type} (${patient.access?.location})
            
            Recent Vitals (Last Session):
            - Pre-Dialysis BP: ${lastSession.preSBP || 'N/A'}/${lastSession.preDBP || 'N/A'}
            - Post-Dialysis BP: ${lastSession.postSBP || 'N/A'}/${lastSession.postDBP || 'N/A'}
            - Pre-Weight: ${lastSession.preWeight || 'N/A'} kg
            - Post-Weight: ${lastSession.postWeight || 'N/A'} kg
            - IDH Events: ${patient.sessions?.filter((s: any) => s.complications?.includes('Hypotension')).length || 0} in last 12 sessions.

            Key Labs:
            - Hemoglobin: ${labs.hemoglobin || 'N/A'} g/dL
            - Albumin: ${labs.albumin || 'N/A'} g/dL
            - Potassium: ${labs.potassium || 'N/A'} mEq/L
            - Phosphate: ${labs.phosphate || 'N/A'} mg/dL
            `;

            const currentMortality30d = patient.mortalityRisk?.['30d'] || 10.0;
            const currentMortality90d = patient.mortalityRisk?.['90d'] || 20.0;

            const systemPrompt = `You are a Nephrologist Risk Prediction AI.
            Predict the impact of clinical interventions on patient mortality and hospitalization risks.

            Input: Detailed Patient Data and Active Clinical Levers (Interventions).
            
            ${contextString}

            CURRENT BASELINE RISK (Before Intervention):
            - 30-Day Mortality: ${currentMortality30d}%
            - 90-Day Mortality: ${currentMortality90d}%

            Task: Estimate the NEW risks based on the active interventions.
            
            CRITICAL RULES FOR REALISM:
            1. GENERAL RULE: Clinical interventions (active levers) should REDUCE risk. Only predict an INCREASE if you identify a specific adverse interaction (e.g., 'Fluid Removal' causing 'Hypotension').
            2. MAX REDUCTION CAP: No single intervention can reduce risk by more than 25% (relative). 
            3. MINIMUM RISK FLOOR: Risk CANNOT drop below 2.0% for any patient.
            4. "Cool Dialysate" reduces IDH events -> Lowers 30d mortality by ~15-20% relative to baseline.
            5. "Access Surveillance" reduces access failure -> Lowers 90d mortality by ~5-10% relative to baseline.
            6. "Nutrition Plan" has minimal 30d impact (< 2% reduction).

            FEW-SHOT EXAMPLES (Follow this logic):
            - Example 1: Baseline 12.0%. Intervention "Cool Dialysate". Prediction -> 10.2% (Valid, ~15% drop).
            - Example 2: Baseline 8.0%. Intervention "Access Surveillance". Prediction -> 7.5% (Valid, small drop).
            - Example 3 (BAD): Baseline 8.0%. Intervention "Any". Prediction -> 0.2% (INVALID - Too low).

            Return ONLY a JSON object with the predicted NEW risks:
            {
                "mortalityRisk30d": number,
                "mortalityRisk90d": number,
                "mortalityRisk1yr": number,
                "hospitalizationRisk30d": number,
                "explanation": "string (concise reason for changes, e.g. 'Cool dialysate reduced IDH risk, lowering mortality by 15%')"
            }
            Do not include markdown formatting.`;

            const completion = await openai.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: JSON.stringify({ activeLevers }, null, 2) }
                ],
                model: 'llama-3.1-8b-instant',
                temperature: 0.1,
            });

            const content = completion.choices[0].message.content || '{}';
            console.log('🤖 AI Prediction Raw:', content.substring(0, 100) + '...'); // Log first 100 chars for debug

            const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(jsonStr);

            // Double check constraints in code (Safety Net)
            const safeRisk = (val: any, fallback: number) => {
                const num = Number(val);
                return !isNaN(num) && val !== null ? num : fallback;
            };

            const finalized = {
                mortalityRisk30d: safeRisk(parsed.mortalityRisk30d, currentMortality30d),
                mortalityRisk90d: safeRisk(parsed.mortalityRisk90d, currentMortality90d),
                mortalityRisk1yr: safeRisk(parsed.mortalityRisk1yr, patient.mortalityRisk?.['1yr'] || 25.0),
                hospitalizationRisk30d: safeRisk(parsed.hospitalizationRisk30d, patient.hospitalizationRisk?.['30d'] || 5.0),
                explanation: parsed.explanation || 'Predicted based on active interventions.'
            };

            // Enforce minimum floor
            if (finalized.mortalityRisk30d < 2.0) finalized.mortalityRisk30d = 2.0;
            if (finalized.mortalityRisk90d < 4.0) finalized.mortalityRisk90d = 4.0;
            if (finalized.mortalityRisk1yr < 10.0) finalized.mortalityRisk1yr = 10.0;

            console.log('✅ Final Safe Prediction:', finalized);
            return finalized;
        } catch (error) {
            console.error('AI Impact Prediction Failed:', error);
            return null;
        }
    }
};
