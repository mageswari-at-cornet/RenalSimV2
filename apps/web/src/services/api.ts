
import type { Patient } from '../types';

// const API_Base = 'http://localhost:3001';
const API_Base = 'https://renalsimapi-production.up.railway.app';

export const api = {
    async getPatients(): Promise<Patient[]> {
        const response = await fetch(`${API_Base}/patients`);
        if (!response.ok) {
            throw new Error('Failed to fetch patients');
        }
        return response.json();
    },

    async getPatient(id: string): Promise<Patient> {
        const maxRetries = 3;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            const response = await fetch(`${API_Base}/patients/${id}`);
            if (response.ok) {
                return response.json();
            }
            // If 404, patient genuinely doesn't exist — don't retry
            if (response.status === 404) {
                throw new Error('Patient not found');
            }
            // For 500s (transient DB errors), wait and retry
            if (attempt < maxRetries - 1) {
                await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
            }
        }
        throw new Error('Failed to fetch patient after retries');
    },

    async predictImpact(patient: Patient, activeLevers: any): Promise<any> {
        const response = await fetch(`${API_Base}/chat/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ patient, activeLevers })
        });
        if (!response.ok) {
            throw new Error('Failed to predict impact');
        }
        return response.json();
    }
};
