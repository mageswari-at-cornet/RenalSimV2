import { FastifyInstance } from 'fastify';
import OpenAI from 'openai';

export async function chatRoutes(fastify: FastifyInstance) {
    const openai = new OpenAI({
        apiKey: process.env.GROK_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
    });

    fastify.post('/chat', async (request, reply) => {
        const { message, context } = request.body as { message: string, context: any };
        console.log('--- CHAT REQUEST ---');
        console.log('Message received:', JSON.stringify(message));
        console.log('Type of message:', typeof message);

        try {
            if (!process.env.GROK_API_KEY) {
                return reply.status(500).send({ error: 'API Key not configured' });
            }

            // Build rich session summary
            const sessionsSummary = (context?.sessions || []).slice(0, 10).map((s: any, i: number) =>
                `Session ${i + 1} (${s.date}): Duration=${s.duration}min, BFR=${s.bfr}mL/min, spKt/V=${s.spktv}, UF=${s.ufVolume}L, PreWeight=${s.preWeight}kg, PostWeight=${s.postWeight}kg, IDWG=${s.idwg}kg, PreBP=${s.preSBP}/${s.preDBP}, NadirSBP=${s.nadirSBP}, PostBP=${s.postSBP}/${s.postDBP}, VP=${s.vp}mmHg, Temp=${s.dialysateTemp}°C, IDH=${s.events?.includes('Hypotension') ? 'YES' : 'No'}${s.terminatedEarly ? ', TERMINATED EARLY' : ''}`
            ).join('\n');

            // Construct System Prompt — RULES FIRST, then data
            const systemPrompt = `You are a nephrology clinical decision support assistant. You are advising a doctor who is looking at a patient's dashboard.

CRITICAL RESPONSE RULES:
- You MUST give a direct clinical conclusion in 2-4 sentences IF asked a clinical question.
- IF the user says 'Hi', 'Hello', or asks a non-clinical question, respond naturally as a helpful clinical copilot without forcing a clinical conclusion.
- FORBIDDEN: Do NOT list, enumerate, or bullet-point any data values. The doctor already sees the dashboard.
- FORBIDDEN: Do NOT suggest additional tests, evaluations, or data collection. Assess with what you have.
- FORBIDDEN: Do NOT say "we need more data" or "further evaluation needed".
- Reference data INLINE within sentences (e.g., "the mean spKt/V of 1.11 with nadir SBP dropping below 100 in 40% of sessions indicates...").
- Start with YES/NO for clinical questions, then a concise justification.

PATIENT CONTEXT (reference only — do not repeat back):
Name: ${context?.name || 'Unknown'} | Age: ${context?.age} | Sex: ${context?.sex || 'Unknown'} | Dx: ${context?.primaryDiagnosis} | Vintage: ${context?.dialysisVintage}mo | Archetype: ${context?.archetype} | Risk: ${context?.riskLevel} | Schedule: ${context?.schedule?.daysPerWeek}x/wk ${context?.schedule?.durationPerSession}min | Access: ${context?.accessType} | DryWt: ${context?.dryWeight}kg | PreHDWt: ${context?.latestWeight}kg | 30d Mort: ${context?.mortalityRisk?.['30d']}% | 30d Hosp: ${context?.hospitalizationRisk?.['30d']}%

SESSIONS:
${sessionsSummary || 'None'}

LABS: ${context?.labs?.filter((l: any, i: number, arr: any[]) => arr.findIndex((x: any) => x.name === l.name) === i).map((l: any) => `${l.name}=${l.value}${l.unit}(${l.status})`).join(', ') || 'None'}

MEDS: ${context?.medications?.map((m: any) => `${m.name} ${m.dose} ${m.frequency}`).join(', ') || 'None'}

ALERTS: ${context?.alerts?.map((a: any) => `[${a.severity}] ${a.description}`).join(', ') || 'None'}`;

            const cleanMessage = (message || '').toString().trim().toLowerCase();
            const greetingRegex = /^\s*(hi|hello|hey|greetings|good\s+morning|good\s+afternoon|good\s+evening)\b/i;
            const isGreeting = greetingRegex.test(cleanMessage) && cleanMessage.length < 20;

            if (isGreeting) {

                return reply.send({
                    response: "Hello! I'm your clinical copilot. I can help you analyze this patient's dialysis sessions, risk trends, and lab results. What would you like to look at?"
                });
            }

            // For clinical questions, use the full patient context and clinical rules
            const messages: any[] = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: 'Example: Is the patient at risk for access failure?' },
                { role: 'assistant', content: 'Yes. The rising VP trend (mean 165mmHg with a slope of +3.2mmHg/session) combined with declining flow rates suggests progressive stenosis, placing this AVG at significant risk of thrombosis within 4-6 weeks without intervention.' },
                { role: 'user', content: `${message}\n\n[RESPOND IN 2-4 SENTENCES ONLY. DO NOT LIST ANY DATA. GIVE A DIRECT CLINICAL CONCLUSION.]` }
            ];

            const completion = await openai.chat.completions.create({
                messages,
                model: 'llama-3.3-70b-versatile',
                temperature: 0.1,
                max_tokens: 250,
            });

            return { response: completion.choices[0].message.content };
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch response from AI' });
        }
    });
    fastify.post('/chat/predict', async (request, reply) => {
        const { patient, activeLevers } = request.body as { patient: any, activeLevers: any };

        try {
            const { AiService } = await import('../services/ai.service');
            const prediction = await AiService.predictInterventionImpact(patient, activeLevers);
            return prediction;
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to predict impact' });
        }
    });
}
