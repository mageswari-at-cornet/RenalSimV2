
import type { Patient } from '../types';

const API_Base = 'http://localhost:3001';

export const api = {
    async getPatients(): Promise<Patient[]> {
        const response = await fetch(`${API_Base}/patients`);
        if (!response.ok) {
            throw new Error('Failed to fetch patients');
        }
        return response.json();
    },

    async getPatient(id: string): Promise<Patient> {
        const response = await fetch(`${API_Base}/patients/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch patient');
        }
        return response.json();
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
