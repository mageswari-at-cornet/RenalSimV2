
import { FastifyInstance } from 'fastify';
import { PatientService } from '../services/patient.service';

export async function patientRoutes(fastify: FastifyInstance) {
    fastify.get('/patients', async (request, reply) => {
        try {
            const patients = await PatientService.getAllPatients();
            return patients;
        } catch (error) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch patients' });
        }
    });

    fastify.get('/patients/:id', async (request, reply) => {
        const { id } = request.params as { id: string };
        try {
            const patient = await PatientService.getPatientDetails(id);
            if (!patient) {
                return reply.status(404).send({ error: 'Patient not found' });
            }
            return patient;
        } catch (error: any) {
            fastify.log.error(error);
            return reply.status(500).send({ error: 'Failed to fetch patient details', details: error.message });
        }
    });
}
