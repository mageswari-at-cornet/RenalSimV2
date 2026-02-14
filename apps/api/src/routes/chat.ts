import { FastifyInstance } from 'fastify';
import OpenAI from 'openai';

export async function chatRoutes(fastify: FastifyInstance) {
    const openai = new OpenAI({
        apiKey: process.env.GROK_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
    });

    fastify.post('/chat', async (request, reply) => {
        const { message, context } = request.body as { message: string, context: any };

        try {
            if (!process.env.GROK_API_KEY) {
                return reply.status(500).send({ error: 'API Key not configured' });
            }

            // Construct System Prompt with Patient Data
            const systemPrompt = `You are a specialized Dialysis Assistant for the RenalSim dashboard.
            
            You have access to the following patient data:
            Name: ${context?.name || 'Unknown'}
            Age: ${context?.age}
            Diagnosis: ${context?.primaryDiagnosis}
            Access Type: ${context?.accessType}
            
            Current Vitals (Last Session):
            - Blood Pressure: ${context?.sessions?.[0]?.postSBP}/${context?.sessions?.[0]?.postDBP}
            - Weight: ${context?.sessions?.[0]?.postWeight} kg
            
            Key Labs:
            ${context?.labs?.map((l: any) => `- ${l.name}: ${l.value} ${l.unit}`).join('\n') || 'No recent labs'}

            Medications:
            ${context?.medications?.map((m: any) => `- ${m.name} ${m.dose}`).join('\n') || 'None'}

            Answer the user's questions based strictly on this data. Be helpful, clinical, and concise.`;

            const completion = await openai.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message }
                ],
                model: 'llama-3.3-70b-versatile',
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
